
/*page pour déverrouiler le site via le mot de passe dans .env.local */
type SearchParams = { from?: string; error?: string };

export default async function UnlockPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  // 1) On attend que searchParams soit disponible (car c’est une Promise)
  const searchParams = await props.searchParams;

  // 2) Valeur de retour après déverrouillage
  const from = searchParams?.from ?? "/";

  // 3) Afficher un message si erreur
  const hasError = searchParams?.error === "1";

  return (
    <main
      style={{
        maxWidth: 420,
        margin: "80px auto",
        fontFamily: "system-ui",
        padding: 16,
      }}
    >
      <h1>Site protégé</h1>
      <p>Entre le mot de passe pour accéder au site.</p>

      {hasError && (
        <p style={{ marginTop: 12 }}>Mot de passe incorrect. Réessaie.</p>
      )}

      <form method="POST" action="/api/unlock" style={{ marginTop: 16 }}>
        <input type="hidden" name="from" value={from} />

        <label>
          Mot de passe
          <input
            name="password"
            type="password"
            style={{
              display: "block",
              width: "100%",
              padding: 10,
              marginTop: 6,
            }}
          />
        </label>

        <button
          type="submit"
          style={{ marginTop: 16, padding: 10, width: "100%" }}
        >
          Déverrouiller
        </button>
      </form>
    </main>
  );
}
