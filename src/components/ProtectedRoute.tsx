import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export const ProtectedRoute = () => {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const [hasProfile, setHasProfile] = useState<boolean | null>(null);
    const location = useLocation();

    useEffect(() => {
        const checkAuthStatus = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);

            if (session) {
                // Vérifier si un profil existe pour cet utilisateur
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', session.user.id)
                    .maybeSingle();

                setHasProfile(!!profile);
            }
            setLoading(false);
        };

        checkAuthStatus();

        // Écouter les changements de session Auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9F9F6] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-green-500 animate-spin"></div>
            </div>
        );
    }

    // Si non connecté → redirect /login
    if (!session) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si connecté mais pas de profil dans `profiles` → redirect /onboarding
    if (session && hasProfile === false && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    // Si connecté + profil existant (ou on est déjà sur onboarding/login pour éviter boucle)
    return <Outlet />;
};
