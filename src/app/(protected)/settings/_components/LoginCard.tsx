import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Key, X, EllipsisIcon, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const LoginCard = () => {
  return (
    <div>
      <p>Login</p>
      <Card className="bg-transparent mt-4">
        <CardContent className="space-y-8">
          {/* Email Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="size-8 rounded-full bg-accent flex items-center justify-center">
                <Mail className="size-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm">Email</p>
                  <Badge variant="success">Verified</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your account is currently linked to{" "}
                  <b className="underline">kylemastercoder14@gmail.com</b>.
                  Update the email used to log into your account.
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon-sm">
              <EllipsisIcon className="size-4" />
            </Button>
          </div>

          {/* Password Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="size-8 rounded-full bg-accent flex items-center justify-center">
                <Key className="size-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm">Password</h3>
                <p className="text-xs text-muted-foreground">
                  Choose or update a password to log into your account.
                </p>
              </div>
            </div>
            <Button variant="outline" size="xs">
              Edit
            </Button>
          </div>

          {/* Google Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="size-8 rounded-full bg-accent flex items-center justify-center">
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">Google</span>
                  <Badge variant="success">Configured</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set up a single sign-on with Google and login with one click.
                </p>
              </div>
            </div>
            <Button variant="outline" size="xs">
              <X className="size-3.5" />
              Unlink
            </Button>
          </div>

          {/* Facebook Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="size-8 rounded-full bg-accent flex items-center justify-center">
                <svg className="size-4" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">Facebook</span>
                  <span className="px-2 py-0.5 text-xs rounded-full dark:bg-red-500/10 dark:text-red-500 bg-red-700/10 text-red-700">
                    Not Configured
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set up a single sign-on with Facebook and login with one
                  click.
                </p>
              </div>
            </div>
            <Button variant="outline" size="xs">
              <ExternalLink className="size-3.5" />
              Link
            </Button>
          </div>

          {/* Microsoft Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="size-8 rounded-full bg-accent flex items-center justify-center">
                <svg className="size-4" viewBox="0 0 23 23" fill="none">
                  <path d="M0 0h11v11H0z" fill="#F25022" />
                  <path d="M12 0h11v11H12z" fill="#7FBA00" />
                  <path d="M0 12h11v11H0z" fill="#00A4EF" />
                  <path d="M12 12h11v11H12z" fill="#FFB900" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">Microsoft</span>
                  <span className="px-2 py-0.5 text-xs rounded-full dark:bg-red-500/10 dark:text-red-500 bg-red-700/10 text-red-700">
                    Not Configured
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set up a single sign-on with Microsoft and login with one
                  click.
                </p>
              </div>
            </div>
            <Button variant="outline" size="xs">
              <ExternalLink className="size-3.5" />
              Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
