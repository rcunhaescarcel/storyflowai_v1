const Videos = () => {
  return (
    <main className="container max-w-screen-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Meus Vídeos</h1>
      <p className="text-muted-foreground mt-2">
        Aqui você encontrará todos os vídeos que você criou.
      </p>
      <div className="mt-8 border rounded-lg p-16 text-center bg-background">
        <p className="text-muted-foreground">Nenhum vídeo encontrado. Em breve, você poderá ver seus projetos salvos aqui.</p>
      </div>
    </main>
  );
};

export default Videos;