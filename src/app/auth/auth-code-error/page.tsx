export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Erro na autenticação</h1>
        <p className="mt-2 text-muted-foreground">
          Algo deu errado ao fazer login. Tente novamente.
        </p>
        <a href="/" className="mt-4 inline-block text-primary underline">
          Voltar ao início
        </a>
      </div>
    </div>
  )
}
