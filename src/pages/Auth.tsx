import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PawPrint, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset-sent';

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, mockNafathLogin } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <div className="min-h-screen flex flex-col bg-background px-6 py-8">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8 pt-4">
        <div className="paw-logo mb-4">
          <PawPrint className="w-10 h-10 text-primary" strokeWidth={2.5} />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-primary text-center mb-8">
        {mode === 'login' && t('auth.login')}
        {mode === 'signup' && t('auth.signup')}
        {mode === 'forgot' && 'استعادة كلمة المرور'}
        {mode === 'reset-sent' && t('auth.resetLinkSent')}
      </h1>

      {/* Forms */}
      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
            <div>
              <label className="aleefna-label">{t('auth.email')}</label>
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
              <label className="aleefna-label">{t('auth.password')}</label>
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
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground"
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
            
            <p className="text-center text-xs text-muted-foreground mt-4">
              بالاستمرار، فإنك توافق على الشروط والأحكام وسياسة الخصوصية
            </p>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4 animate-fade-in">
            <div>
              <label className="aleefna-label">{t('auth.fullName')}</label>
              <Input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Mohammed Ahmed"
                className="text-start"
                dir="auto"
                required 
              />
            </div>
            <div>
              <label className="aleefna-label">{t('auth.email')}</label>
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
              <label className="aleefna-label">{t('auth.password')}</label>
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
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="aleefna-label">{t('auth.confirmPassword')}</label>
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
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="aleefna-label">{t('auth.userType')}</label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختيار نوع المستخدم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">{t('userTypes.owner')}</SelectItem>
                  <SelectItem value="clinic">{t('userTypes.clinic')}</SelectItem>
                  <SelectItem value="store">{t('userTypes.store')}</SelectItem>
                  <SelectItem value="shelter">{t('userTypes.shelter')}</SelectItem>
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
              بالاستمرار، فإنك توافق على الشروط والأحكام وسياسة الخصوصية
            </p>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-5 animate-fade-in">
            <p className="text-muted-foreground text-sm text-center mb-4">
              من فضلك أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين
            </p>
            <div>
              <label className="aleefna-label">{t('auth.email')}</label>
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
            <p className="text-muted-foreground text-sm">
              تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني
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
