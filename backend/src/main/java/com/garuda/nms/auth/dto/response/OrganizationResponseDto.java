package com.garuda.nms.auth.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Data Transfer Object for populating the Customer/Organization dropdown selector.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Customer Organization Dropdown Item")
public class OrganizationResponseDto {

    @Schema(example = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
    private UUID id;

    @Schema(example = "Acme Networks — APAC Operations")
    private String orgName;

    @Schema(example = "ACME-APAC")
    private String orgCode;

    @Schema(example = "acme.com")
    private String domainName;
}