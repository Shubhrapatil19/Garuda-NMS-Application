"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "../../services/authService";
import { sanitizeApiError } from "../../utils/errorHandler";
import {
  SignupFormData,
  validateField,
  getPasswordStrength,
  PasswordStrength,
} from "./signupValidation";

const INITIAL_FORM_DATA: SignupFormData = {
  fullName: "",
  workEmail: "",
  password: "",
  confirmPassword: "",
  verificationCode: "",
  region: "ap-south-1",
  agreedToTerms: false,
};

const FIELDS_TO_VALIDATE: (keyof SignupFormData)[] = [
  "fullName",
  "workEmail",
  "password",
  "confirmPassword",
  "verificationCode",
  "agreedToTerms",
];

export interface UseSignupFormReturn {
  formData: SignupFormData;
  touched: Partial<Record<keyof SignupFormData, boolean>>;
  fieldErrors: Partial<Record<keyof SignupFormData, string>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  isSubmitting: boolean;
  errorMsg: string;
  isSendingCode: boolean;
  codeSent: boolean;
  resendTimer: number;
  strength: PasswordStrength;
  handleFieldChange: (field: keyof SignupFormData, val: string | boolean) => void;
  handleFieldBlur: (field: keyof SignupFormData) => void;
  handleSendCode: () => Promise<void>;
  handleSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => Promise<void>;
}

export function useSignupForm(): UseSignupFormReturn {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>(INITIAL_FORM_DATA);
  const [touched, setTouched] = useState<Partial<Record<keyof SignupFormData, boolean>>>({});
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const strength = getPasswordStrength(formData.password);

  const handleFieldChange = (field: keyof SignupFormData, val: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (touched[field]) {
      const err = validateField(field, val, formData.password, codeSent);
      setFieldErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleFieldBlur = (field: keyof SignupFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field], formData.password, codeSent);
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSendCode = async () => {
    const emailErr = validateField("workEmail", formData.workEmail, formData.password, codeSent);
    setTouched((prev) => ({ ...prev, workEmail: true }));
    setFieldErrors((prev) => ({ ...prev, workEmail: emailErr }));

    if (emailErr || !formData.workEmail.trim()) {
      toast.error("Valid work email required", {
        description: "Please enter your work email first to receive a verification code.",
      });
      return;
    }

    setIsSendingCode(true);
    try {
      await authService.sendSignupOtp(formData.workEmail.trim());
      setCodeSent(true);
      setResendTimer(60);
      toast.success("Verification code dispatched", {
        description: `We've sent a 6-digit code to ${formData.workEmail.trim()}. Check your inbox.`,
      });
    } catch (err: unknown) {
      const msg = sanitizeApiError(err, "Failed to send verification code.");
      toast.error("Dispatch Failed", { description: msg });
    } finally {
      setIsSendingCode(false);
    }
  };

  const collectErrors = (): Partial<Record<keyof SignupFormData, string>> => {
    const errors: Partial<Record<keyof SignupFormData, string>> = {};
    for (const f of FIELDS_TO_VALIDATE) {
      const err = validateField(f, formData[f], formData.password, codeSent);
      if (err) errors[f] = err;
    }
    return errors;
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    const errors = collectErrors();
    setTouched({
      fullName: true,
      workEmail: true,
      password: true,
      confirmPassword: true,
      verificationCode: true,
      agreedToTerms: true,
    });
    setFieldErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      toast.error("Please resolve highlighted issues", {
        description: "Required fields are missing or invalid.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.signup({
        fullName: formData.fullName.trim(),
        workEmail: formData.workEmail.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        verificationCode: formData.verificationCode.trim(),
        agreeToTerms: formData.agreedToTerms,
      });

      toast.success("Enterprise Account Provisioned!", {
        description: "Welcome to Garuda NMS. Redirecting to workspace console...",
      });

      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(formData.workEmail.trim())}`);
      }, 700);
    } catch (err: unknown) {
      const msg = sanitizeApiError(err, "Failed to complete onboarding.");
      setErrorMsg(msg);
      toast.error("Registration Unsuccessful", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    touched,
    fieldErrors,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isSubmitting,
    errorMsg,
    isSendingCode,
    codeSent,
    resendTimer,
    strength,
    handleFieldChange,
    handleFieldBlur,
    handleSendCode,
    handleSubmit,
  };
}
