export default function LoginPage() {
  return (
    <main style={{ maxWidth: 420, margin: "80px auto", fontFamily: "system-ui" }}>
      <h1>Connexion</h1>
      <p>Cette page servira plus tard pour l’accès admin / prof.</p>

      <form>
        <label>
          Email
          <input type="email" name="email" style={{ display: "block", width: "100%", padding: 10, marginTop: 6 }} />
        </label>

        <label style={{ display: "block", marginTop: 12 }}>
          Mot de passe
          <input type="password" name="password" style={{ display: "block", width: "100%", padding: 10, marginTop: 6 }} />
        </label>

        <button type="submit" style={{ marginTop: 16, padding: 10, width: "100%" }}>
          Se connecter
        </button>
      </form>
    </main>
  );
}
