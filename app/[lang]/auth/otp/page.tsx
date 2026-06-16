import { OTPForm } from '@/features/auth/otp-form'

export const dynamic = "force-dynamic";

export default function page() {

  return (
    <OTPForm
      className='translate-x-0 transition-all duration-500 ease-in-out'
    />
  )
}
