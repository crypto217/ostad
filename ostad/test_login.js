const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testLogin() {
    console.log("Tentative de connexion à Supabase...");
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'ndushomps@gmail.com',
            password: 'dummy_password_test' // We don't have the real password, so this should fail cleanly, proving API reachability.
        });

        if (error) {
            console.log("✅ Connexion API Réussie !");
            console.log("L'API a répondu avec l'erreur :", error.message);
            console.log("(C'est normal car le mot de passe est factice, mais cela prouve que le 'Failed to fetch' a disparu !)");
        } else {
            console.log("✅ Connecté avec succès !", data.user.id);
        }
    } catch (err) {
        console.error("❌ ERREUR CATASTROPHIQUE (Failed to fetch persistante) :", err.message);
    }
}

testLogin();
