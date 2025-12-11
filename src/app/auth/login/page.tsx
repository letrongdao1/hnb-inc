import LoginPage from "@/components/auth/login/LoginPage";

export const metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập HNB Hub",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Login() {
  return <LoginPage />;
}
