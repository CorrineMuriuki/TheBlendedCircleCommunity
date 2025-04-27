import { useState, useEffect } from 'react';
import { Button } from './button';
import { Card } from './card';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem('cookie-consent');
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:max-w-md">
      <Card className="p-4 shadow-lg border-2">
        <div className="space-y-3">
          <h3 className="font-medium">Cookie Policy</h3>
          <p className="text-sm text-muted-foreground">
            We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleAccept} variant="default">Accept</Button>
            <Button onClick={handleAccept} variant="outline">Decline</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
