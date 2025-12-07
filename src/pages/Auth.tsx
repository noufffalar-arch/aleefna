import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PawPrint, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset-sent';

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, mockNafathLogin } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState('owner');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(t('auth.loginError'), { description: error.message });
    } else {
      toast.success(t('auth.loginSuccess'));
      navigate('/dashboard');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName, userType);
    setLoading(false);
    if (error) {
      toast.error(t('auth.signupError'), { description: error.message });
    } else {
      toast.success(t('auth.signupSuccess'));
      navigate('/dashboard');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setMode('reset-sent');
    }
  };

  const handleNafathLogin = async () => {
    setLoading(true);
    const { error } = await mockNafathLogin();
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('auth.loginSuccess'));
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col aleefna-gradient-bg px-6 py-8">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
          <PawPrint className="w-12 h-12 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-primary">{t('app.name')}</h1>
      </div>

      {/* Forms */}
      <div className="flex-1 flex flex-col">
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
            <div>
              <Label className="text-foreground mb-2 block">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="ps-12" placeholder="example@email.com" required />
              </div>
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="ps-12" placeholder="••••••••" required />
              </div>
            </div>
            <Button type="submit" className="w-full" variant="aleefna" disabled={loading}>
              {loading ? t('common.loading') : t('auth.login')}
            </Button>
            <button type="button" onClick={() => setMode('forgot')} className="text-primary text-sm w-full text-center">
              {t('auth.forgotPassword')} {t('auth.clickHere')}
            </button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
              <div className="relative flex justify-center text-sm"><span className="bg-background px-2 text-muted-foreground">أو</span></div>
            </div>
            <Button type="button" variant="nafath" className="w-full" onClick={handleNafathLogin} disabled={loading}>
              {t('auth.loginWithNafath')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.noAccount')} <button type="button" onClick={() => setMode('signup')} className="text-primary font-semibold">{t('auth.signup')}</button>
            </p>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4 animate-fade-in">
            <div>
              <Label className="text-foreground mb-2 block">{t('auth.fullName')}</Label>
              <div className="relative">
                <User className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="ps-12" required />
              </div>
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="ps-12" required />
              </div>
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t('auth.password')}</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t('auth.confirmPassword')}</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t('auth.userType')}</Label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">{t('userTypes.owner')}</SelectItem>
                  <SelectItem value="clinic">{t('userTypes.clinic')}</SelectItem>
                  <SelectItem value="store">{t('userTypes.store')}</SelectItem>
                  <SelectItem value="shelter">{t('userTypes.shelter')}</SelectItem>
                  <SelectItem value="government">{t('userTypes.government')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" variant="aleefna" disabled={loading}>
              {loading ? t('common.loading') : t('auth.signup')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.haveAccount')} <button type="button" onClick={() => setMode('login')} className="text-primary font-semibold">{t('auth.login')}</button>
            </p>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 animate-fade-in">
            <button type="button" onClick={() => setMode('login')} className="flex items-center gap-2 text-muted-foreground mb-4">
              <ArrowLeft className="w-4 h-4" /> {t('common.back')}
            </button>
            <div>
              <Label className="text-foreground mb-2 block">{t('auth.email')}</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" variant="aleefna" disabled={loading}>
              {loading ? t('common.loading') : t('auth.sendResetLink')}
            </Button>
          </form>
        )}

        {mode === 'reset-sent' && (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">{t('auth.resetLinkSent')}</h2>
            <p className="text-muted-foreground">{t('auth.resetLinkMessage')}</p>
            <Button onClick={() => setMode('login')} variant="aleefna" className="w-full">
              {t('auth.backToLogin')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
