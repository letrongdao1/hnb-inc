import SignupPage from "@/components/auth/signup";

export const metadata = {
  title: "Đăng ký tài khoản HNB Hub",
  description: "Đăng ký tài khoản HNB Hub",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Signup() {
  return <SignupPage />;
}
