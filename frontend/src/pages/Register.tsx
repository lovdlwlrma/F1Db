import Background from '@/components/Background';
import RegisterCard from '@/components/RegisterCard';
import logo from '@/assets/logo.png';
import RegisterLayout from '@/layouts/RegisterLayout';

const Register = () => {
  return (
    <>
      <div className="fixed inset-0 z-0">
        <Background />
      </div>

      <div className="absolute top-4 left-4 z-50">
        <img src={logo} alt="Logo" className="h-16 w-auto" />
      </div>

      <RegisterLayout>
        <RegisterCard />
      </RegisterLayout>
    </>
  );
};

export default Register;
