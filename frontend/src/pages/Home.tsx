import Background from "@/components/Background";
import AuthLayout from "@/layouts/AuthLayout";
import AuthCard from "@/components/AuthCard";
import logo from "@/assets/logo.png";

const Home = () => {
  return (
    <>
      <Background />

      <div className="absolute top-4 left-4 z-50">
        <img src={logo} alt="Logo" className="h-16 w-auto" />
      </div>

      <AuthLayout>
        <AuthCard />
      </AuthLayout>
    </>
  );
};

export default Home;
