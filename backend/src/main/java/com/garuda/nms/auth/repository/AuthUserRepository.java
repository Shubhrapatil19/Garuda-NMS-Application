package com.garuda.nms.auth.repository;

import com.garuda.nms.auth.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for authentication and user management using pure native PostgreSQL queries.
 */
@Repository
public interface AuthUserRepository extends JpaRepository<UserEntity, UUID> {

    // 1. Check if email already exists in users table
    @Query(value = "SELECT COUNT(*) > 0 FROM users WHERE email = :email", nativeQuery = true)
    boolean existsByEmailNative(@Param("email") String email);

    // 2. Find user by email and organization ID (Password login)
    @Query(value = "SELECT * FROM users WHERE email = :email AND organization_id = :orgId AND is_active = true", nativeQuery = true)
    Optional<UserEntity> findByEmailAndOrgNative(@Param("email") String email, @Param("orgId") UUID orgId);

    // 3. Find user by email only
    @Query(value = "SELECT * FROM users WHERE email = :email AND is_active = true", nativeQuery = true)
    Optional<UserEntity> findByEmailNative(@Param("email") String email);

    // 4. Find organization ID by email domain (e.g., 'revdau.ai' or 'acme.com')
    @Query(value = "SELECT id FROM organizations WHERE domain_name = :domain AND is_active = true LIMIT 1", nativeQuery = true)
    Optional<UUID> findOrgIdByDomainNative(@Param("domain") String domain);

    // 5. Get organization name by organization ID
    @Query(value = "SELECT org_name FROM organizations WHERE id = :orgId", nativeQuery = true)
    Optional<String> findOrgNameByIdNative(@Param("orgId") UUID orgId);

    // 6. Fetch all active organizations for UI dropdown selector
    @Query(value = "SELECT id, org_name, org_code, domain_name FROM organizations WHERE is_active = true ORDER BY org_name ASC", nativeQuery = true)
    List<Object[]> findAllActiveOrganizationsNative();

    // 7. Insert new user with BCrypt hashed password
    @Modifying
    @Query(value = """
        INSERT INTO users (id, organization_id, full_name, email, username, password_hash, auth_provider, is_email_verified, is_active, created_at, updated_at) 
        VALUES (:id, :orgId, :fullName, :email, :email, :passwordHash, 'LOCAL', true, true, NOW(), NOW())
    """, nativeQuery = true)
    void insertUserNative(
            @Param("id") UUID id,
            @Param("orgId") UUID orgId,
            @Param("fullName") String fullName,
            @Param("email") String email,
            @Param("passwordHash") String passwordHash
    );

    // 8. Assign default role (NETWORK_ENGINEER) to user
    @Modifying
    @Query(value = "INSERT INTO user_roles (user_id, role_id) VALUES (:userId, (SELECT id FROM roles WHERE role_name = 'NETWORK_ENGINEER'))", nativeQuery = true)
    void assignDefaultRoleNative(@Param("userId") UUID userId);

    // 9. Fetch roles assigned to user
    @Query(value = """
        SELECT r.role_name FROM roles r 
        INNER JOIN user_roles ur ON r.id = ur.role_id 
        WHERE ur.user_id = :userId
    """, nativeQuery = true)
    List<String> findRoleNamesByUserIdNative(@Param("userId") UUID userId);

    // 10. Update last login timestamp
    @Modifying
    @Query(value = "UPDATE users SET last_login_at = :loginTime WHERE id = :userId", nativeQuery = true)
    void updateLastLoginNative(@Param("userId") UUID userId, @Param("loginTime") Instant loginTime);

    // 11. Save 6-digit verification / login OTP
// Naya correct code:
    @Modifying
    @Query(value = """
        INSERT INTO verification_otps (id, email, otp_code, otp_type, is_used, expires_at, created_at)
        VALUES (gen_random_uuid(), :email, :otp, :otpType, false, NOW() + INTERVAL '10 MINUTES', NOW())
    """, nativeQuery = true)
    void saveOtpNative(@Param("email") String email, @Param("otp") String otp, @Param("otpType") String otpType);

    // 12. Validate OTP code
    @Query(value = """
        SELECT COUNT(*) > 0 FROM verification_otps 
        WHERE email = :email AND otp_code = :otp AND otp_type = :otpType AND is_used = false AND expires_at > NOW()
    """, nativeQuery = true)
    boolean isOtpValidNative(@Param("email") String email, @Param("otp") String otp, @Param("otpType") String otpType);

    // 13. Mark OTP as used
    @Modifying
    @Query(value = "UPDATE verification_otps SET is_used = true WHERE email = :email AND otp_code = :otp", nativeQuery = true)
    void markOtpUsedNative(@Param("email") String email, @Param("otp") String otp);

    // 14. Find user by OAuth provider and email
    @Query(value = "SELECT * FROM users WHERE email = :email AND auth_provider = :provider AND is_active = true", nativeQuery = true)
    Optional<UserEntity> findByEmailAndProviderNative(@Param("email") String email, @Param("provider") String provider);

    // 15. Insert OAuth user (Google / GitHub) without password
    @Modifying
    @Query(value = """
        INSERT INTO users (id, organization_id, full_name, email, username, password_hash, auth_provider, is_email_verified, is_active, created_at, updated_at) 
        VALUES (:id, :orgId, :fullName, :email, :email, NULL, :provider, true, true, NOW(), NOW())
    """, nativeQuery = true)
    void insertOAuthUserNative(
            @Param("id") UUID id,
            @Param("orgId") UUID orgId,
            @Param("fullName") String fullName,
            @Param("email") String email,
            @Param("provider") String provider
    );

    // 16. Update password for first-time setup or password reset
    @Modifying
    @Query(value = "UPDATE users SET password_hash = :passwordHash, updated_at = NOW() WHERE id = :userId", nativeQuery = true)
    void updatePasswordNative(@Param("userId") UUID userId, @Param("passwordHash") String passwordHash);

    // 17. Find email by active reset token (Valid within 15 minutes and unused)
    @Query(value = """
        SELECT email FROM verification_otps 
        WHERE otp_code = :token AND otp_type = 'PASSWORD_RESET' AND is_used = false AND expires_at > NOW() 
        LIMIT 1
    """, nativeQuery = true)
    Optional<String> findEmailByValidResetTokenNative(@Param("token") String token);

    // 18. Invalidate password reset token after successful reset
    @Modifying
    @Query(value = "UPDATE verification_otps SET is_used = true WHERE otp_code = :token AND otp_type = 'PASSWORD_RESET'", nativeQuery = true)
    void markResetTokenUsedNative(@Param("token") String token);

    // 19. Update password directly by email
    @Modifying
    @Query(value = "UPDATE users SET password_hash = :passwordHash, updated_at = NOW() WHERE email = :email", nativeQuery = true)
    void updatePasswordByEmailNative(@Param("email") String email, @Param("passwordHash") String passwordHash);
}