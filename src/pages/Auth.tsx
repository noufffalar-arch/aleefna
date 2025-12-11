import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PawPrint, Eye, EyeOff, Globe, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { changeLanguage } from '@/i18n';
import useRTL from '@/hooks/useRTL';

// Validation schemas
const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password too long')
});

const signupSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password too long'),
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  mobileNumber: z.string().regex(/^05\d{8}$/, 'Invalid Saudi mobile number (05xxxxxxxx)')
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255, 'Email too long')
});

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset-sent';

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, mockNafathLogin, enterGuestMode } = useAuth();
  const { isRtl } = useRTL();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [userType, setUserType] = useState('owner');

  const toggleLanguage = () => {
    changeLanguage(isRtl ? 'en' : 'ar');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }
    
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
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
    
    // Validate input
    const validation = signupSchema.safeParse({ email, password, fullName, mobileNumber });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }
    
    setLoading(true);
    const { error } = await signUp(email.trim(), password, fullName.trim(), userType, mobileNumber);
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
    
    // Validate input
    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }
    
    setLoading(true);
    const { error } = await resetPassword(email.trim());
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

  const handleGuestMode = () => {
    enterGuestMode();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background px-6 py-8 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Language Toggle */}
      <div className="flex justify-start">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>{isRtl ? 'English' : 'العربية'}</span>
        </button>
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center mb-4 pt-2">
        <div className="paw-logo mb-2">
          <PawPrint className="w-8 h-8 text-primary" strokeWidth={2.5} />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-primary text-center mb-6">
        {mode === 'login' && t('auth.login')}
        {mode === 'signup' && t('auth.signup')}
        {mode === 'forgot' && t('auth.forgotPassword')}
        {mode === 'reset-sent' && t('auth.resetLinkSent')}
      </h1>

      {/* Forms */}
      <div className="max-w-sm mx-auto w-full pb-8">
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
            <div>
              <label className="aleefna-label text-start">{t('auth.email')}</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Aleefna@gmail.com" 
                className="text-start"
                dir="ltr"
                required 
              />
            </div>
            <div>
              <label className="aleefna-label text-start">{t('auth.password')}</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="text-start pe-12"
                  dir="ltr"
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 text-muted-foreground end-4"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button type="button" onClick={() => setMode('forgot')} className="text-primary text-sm w-full text-center">
              {t('auth.forgotPassword')} {t('auth.clickHere')}
            </button>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('common.loading') : t('auth.login')}
            </Button>
            
            <Button type="button" variant="secondary" className="w-full" onClick={() => setMode('signup')}>
              {t('auth.signup')}
            </Button>
            
            <Button type="button" variant="outline" className="w-full border-primary text-primary" onClick={handleNafathLogin} disabled={loading}>
              {t('auth.loginWithNafath')}
            </Button>

            <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={handleGuestMode}>
              <UserX className="w-4 h-4 me-2" />
              {t('auth.continueAsGuest')}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground mt-4">
              {t('auth.termsAgreement')}
            </p>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4 animate-fade-in">
            <div>
              <label className="aleefna-label text-start">{t('auth.fullName')}</label>
              <Input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder={isRtl ? "محمد أحمد" : "Mohammed Ahmed"}
                className="text-start"
                dir="auto"
                required 
              />
            </div>
            <div>
              <label className="aleefna-label text-start">{t('auth.email')}</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Aleefna@gmail.com"
                className="text-start"
                dir="ltr"
                required 
              />
            </div>
            <div>
              <label className="aleefna-label text-start">{t('auth.mobile')}</label>
              <Input 
                type="tel" 
                value={mobileNumber} 
                onChange={(e) => setMobileNumber(e.target.value)} 
                placeholder="05xxxxxxxx"
                className="text-start"
                dir="ltr"
                required 
              />
            </div>
            <div>
              <label className="aleefna-label text-start">{t('auth.password')}</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="text-start pe-12"
                  dir="ltr"
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 text-muted-foreground end-4"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="aleefna-label text-start">{t('auth.confirmPassword')}</label>
              <div className="relative">
                <Input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="text-start pe-12"
                  dir="ltr"
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 -translate-y-1/2 text-muted-foreground end-4"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="aleefna-label text-start">{t('auth.userType')}</label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger className="w-full text-start">
                  <SelectValue placeholder={t('auth.selectUserType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">{t('userTypes.owner')}</SelectItem>
                  <SelectItem value="shelter">{t('userTypes.shelter')}</SelectItem>
                  <SelectItem value="clinic">{t('userTypes.clinic')}</SelectItem>
                  <SelectItem value="store">{t('userTypes.store')}</SelectItem>
                  <SelectItem value="government">{t('userTypes.government')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? t('common.loading') : t('auth.signup')}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.haveAccount')} <button type="button" onClick={() => setMode('login')} className="text-primary font-semibold">{t('auth.login')}</button>
            </p>
            
            <p className="text-center text-xs text-muted-foreground">
              {t('auth.termsAgreement')}
            </p>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-5 animate-fade-in">
            <p className="text-muted-foreground text-sm text-center mb-4">
              {t('auth.forgotPasswordHint')}
            </p>
            <div>
              <label className="aleefna-label text-start">{t('auth.email')}</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Aleefna@gmail.com"
                className="text-start"
                dir="ltr"
                required 
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('common.loading') : t('auth.sendResetLink')}
            </Button>
            <Button type="button" variant="secondary" className="w-full" onClick={() => setMode('login')}>
              {t('auth.backToLogin')}
            </Button>
          </form>
        )}

        {mode === 'reset-sent' && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="paw-logo mx-auto">
              <PawPrint className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-primary">{t('auth.resetLinkSent')}</h2>
            <p className="text-muted-foreground text-sm text-center">
              {t('auth.resetLinkMessage')}
            </p>
            <Button onClick={() => setMode('login')} className="w-full">
              {t('auth.backToLogin')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
