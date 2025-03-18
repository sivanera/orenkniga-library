
import React, { useEffect } from 'react';
import Layout from '@/components/Layout';
import AuthForm from '@/components/AuthForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Auth: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  return (
    <Layout hideNavbar className="p-4 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary animate-slide-down">OrenKniga</h1>
          <p className="text-muted-foreground mt-2 animate-slide-down" style={{ animationDelay: '100ms' }}>
            Ваша электронная библиотека
          </p>
        </div>
        
        <AuthForm />
      </div>
    </Layout>
  );
};

export default Auth;
