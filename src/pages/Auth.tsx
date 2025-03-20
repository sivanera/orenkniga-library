
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import AuthForm from '@/components/AuthForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Auth: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [previousPath, setPreviousPath] = useState<string>('/');

  useEffect(() => {
    // Get referrer from state or default to homepage
    const from = location.state?.from || '/';
    setPreviousPath(from);
    
    if (user && !isLoading) {
      navigate(from);
    }
  }, [user, isLoading, navigate, location.state]);

  const handleGoBack = () => {
    navigate(previousPath);
  };

  return (
    <Layout hideNavbar className="p-4 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto py-12 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute left-0 top-0" 
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary animate-slide-down font-serif">OrenKniga</h1>
          <p className="text-muted-foreground mt-2 animate-slide-down font-serif" style={{ animationDelay: '100ms' }}>
            Ваша электронная библиотека
          </p>
        </div>
        
        <AuthForm />
      </div>
    </Layout>
  );
};

export default Auth;
