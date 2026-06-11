import * as yup from 'yup'
import { typeRegisterSchema } from './base/type-register.schema'
import { nameSchema } from './base/name.schema'
import { emailSchema } from './base/email.schema'
import { phoneSchema } from './base/phone.schema'
import { passwordSchema } from './base/password.schema'
import { password_confirmationSchema } from './base/confirm-password.schema'

export const signUpSchema = yup.object(
  {
    full_name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    password_confirmation: password_confirmationSchema,
    captchaToken: yup.string().nullable(),
    type_register: typeRegisterSchema,
  }
)

export const signInSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
})

export const otpSchema = yup.object().shape({
  email: emailSchema,
})

export const sendOtpSchema = yup.object({
  email: emailSchema,
})

export const verifyOtpSchema = yup.object({
  email: emailSchema,
  token: yup.string().length(6).required(),
})

export type OTPFormInput = yup.InferType<typeof otpSchema>
export type SignInFormInput = yup.InferType<typeof signInSchema>
export type SignUpFormInput = yup.InferType<typeof signUpSchema>

export const defaultSignInValues: SignInFormInput = {
  email: '',
  password: '',
};

export const defaultSignUpValues: SignUpFormInput = {
  full_name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  type_register: true,
  captchaToken: undefined,
};
