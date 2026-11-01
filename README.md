# As Minhas Receitas TM7

Caderno pessoal de receitas em português de Portugal, pensado para o iPhone. Aplicação PWA gratuita, sem conta, publicidade ou serviços externos. Os parâmetros são consultados na aplicação e introduzidos manualmente na Bimby TM7; não existe comunicação com o equipamento.

## Publicar no GitHub Pages

1. Integre este pull request no ramo `main`.
2. No GitHub, abra **Settings → Pages → Build and deployment → Source** e escolha **GitHub Actions**.
3. Em **Actions**, execute o workflow **Testes e GitHub Pages**, caso ainda não tenha sido executado após configurar Pages.
4. Quando a publicação terminar, abra <https://filipamoura28.github.io/as-minhas-receitas-tm7/>.

Não precisa de domínio nem de serviços pagos. O código é público; as receitas pessoais não são enviadas para o repositório ou para um servidor. O workflow publica apenas os ficheiros da aplicação.

## Instalar no iPhone

1. Abra o endereço publicado no **Safari**, com internet.
2. Aguarde a indicação **Aplicação disponível offline** no fundo da biblioteca.
3. Toque em **Partilhar → Adicionar ao ecrã principal → Adicionar**.
4. Abra o ícone **Receitas TM7**. Pode usar a aplicação em modo de voo depois de o carregamento inicial terminar.

A instalação não é obrigatória para utilizar a aplicação no navegador. O modo offline requer HTTPS (ou localhost durante desenvolvimento). Para receber uma atualização, abra com internet, depois feche todas as janelas da aplicação e volte a abrir.

## Utilização

- Toque em **Nova receita** e preencha nome, categoria, doses, tempo total de preparação, ingredientes e passos. A fotografia é opcional. Acrescente quantos ingredientes e passos precisar e toque em **Guardar receita**.
- As categorias são livres; surgem automaticamente nos filtros. A pesquisa por nome ignora maiúsculas e acentos.
- Abra uma receita para **Editar**, **Duplicar** ou **Eliminar**. Eliminar exige confirmação.
- Em **Começar a cozinhar**, consulte um passo de cada vez usando **Anterior** e **Seguinte**. **Ingredientes** abre a lista sem perder o passo atual. **Concluir** termina a preparação.
- Tempo, temperatura e velocidade de cada passo são texto livre (por exemplo, `5 min`, `100 °C`, `colher`). A rotação inversa tem uma opção própria. A aplicação não valida se uma combinação é adequada ao equipamento; siga as instruções e limites do fabricante.
- Não há receitas de demonstração nem atualização de código necessária para criar receitas novas.

## Cópias de segurança e armazenamento

Em **Cópias de segurança**, escolha **Exportar todas as receitas** e guarde o JSON em Ficheiros/iCloud Drive. O ficheiro inclui as fotografias e todos os parâmetros dos passos. Para recuperar ou transferir para outro dispositivo, selecione o ficheiro e escolha:

- **Juntar**: mantém as receitas existentes, atualizando as que tenham o mesmo identificador.
- **Substituir**: remove a biblioteca atual e grava o conteúdo do ficheiro, após confirmação.

O ficheiro completo é validado antes de qualquer alteração. A gravação de todas as receitas importadas ocorre numa única transação IndexedDB. Ficheiros inválidos não alteram a biblioteca. O limite de importação é 100 MB e 2000 receitas por ficheiro. Fotografias carregadas são reduzidas para um máximo de 1400 px e convertidas para JPEG; JPEG, PNG e WebP são recomendados. HEIC depende do suporte do navegador.

Os dados ficam em **IndexedDB**, no dispositivo e na origem utilizada. Safari, aplicação instalada, outro navegador ou outro endereço podem ter bibliotecas separadas. Não existe sincronização automática. A aplicação pede armazenamento persistente quando suportado, mas o iOS pode remover dados por falta de espaço ou ao limpar os dados do site. **Exporte cópias regularmente e antes de trocar de dispositivo ou limpar o Safari.** Uma cópia JSON contém dados pessoais e fotografias: guarde-a num local da sua confiança.

## Desenvolvimento e testes

Requer Node.js 24 para as verificações; a aplicação em produção não tem dependências.

```sh
npm ci
npm run check
npm test
python3 -m http.server 4173
```

Abra `http://localhost:4173`. Não abra `index.html` diretamente através de `file://`.

Os testes automáticos verificam validação, pesquisa, rejeição de importações inválidas e preservação de fotografias/parâmetros no JSON. Foi também verificado em Chromium a 390 × 844: criação com fotografia, persistência após recarregar, edição, duplicação, eliminação, cozinha guiada, consulta de ingredientes, recuperação via JSON e recarregamento offline. A instalação e os comportamentos específicos do Safari/iOS precisam de verificação num iPhone real.

### Estrutura

- `src/app.js`: interface e fluxos de utilização.
- `src/data.js`: IndexedDB, validação e formato JSON versionado.
- `src/style.css`: interface responsiva, sem fontes externas.
- `sw.js`: cache da aplicação para utilização offline. Ao alterar ficheiros públicos, incremente a versão `CACHE` para distribuir a atualização.
- `manifest.webmanifest` e `icons/`: instalação PWA e ícone Apple.
- `.github/workflows/pages.yml`: testes em PRs e publicação após integração no `main`.

O service worker guarda apenas os ficheiros da aplicação. As receitas e fotografias ficam no IndexedDB e não são removidas ao atualizar a cache. A versão inicial da base de dados é 1; alterações futuras ao esquema devem usar migrações em `onupgradeneeded`.
