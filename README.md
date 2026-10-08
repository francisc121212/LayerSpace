# LayerSpace

LayerSpace e uma aplicacao desktop experimental para composicao visual em camadas 3D. O projeto usa Electron para abrir a aplicacao como programa local e A-Frame para renderizar a cena 3D no navegador embutido.

## Funcionalidades

- Criar composicoes com uma camada de fundo e tres camadas editaveis.
- Carregar imagens locais em cada camada.
- Ajustar posicao X, posicao Y, profundidade Z, escala e rotacao.
- Ocultar ou mostrar camadas individualmente.
- Repor transformacoes da camada ativa.
- Recentrar a camara da cena.
- Exportar a vista atual como imagem PNG.

## Tecnologias

- HTML, CSS e JavaScript puro.
- Electron.
- A-Frame.
- electron-builder para gerar executavel portable em Windows.

## Requisitos

- Node.js instalado.
- npm instalado.

## Instalacao

Instale as dependencias do projeto:

```bash
npm install
```

## Executar em desenvolvimento

Abra a aplicacao com:

```bash
npm start
```

## Gerar executavel

Crie a versao portable para Windows com:

```bash
npm run build
```

O ficheiro gerado fica na pasta `dist/`.

## Estrutura do projeto

```text
.
|-- index.html        # Interface principal e cena A-Frame
|-- style.css         # Estilos da interface
|-- script.js         # Logica das camadas, controlos e exportacao
|-- main.js           # Processo principal do Electron
|-- package.json      # Scripts, dependencias e configuracao de build
`-- package-lock.json # Versoes bloqueadas das dependencias
```

## Como usar

1. Escolha a camada ativa no seletor.
2. Carregue uma imagem para essa camada.
3. Ajuste os controlos de posicao, profundidade, escala e rotacao.
4. Repita o processo nas restantes camadas.
5. Use a vista 3D para navegar pela composicao.
6. Exporte a imagem quando a composicao estiver pronta.

## Boas praticas observadas

- O processo principal do Electron esta separado da logica da interface.
- O Electron esta configurado com `contextIsolation: true`, `nodeIntegration: false` e `sandbox: true`.
- A manipulacao do DOM usa `textContent` para texto dinamico, reduzindo risco de injecao acidental de HTML.
- Os URLs temporarios de imagens sao libertados quando uma imagem e substituida.
- O estado das camadas esta centralizado em objetos de configuracao, o que facilita manutencao.
- A interface inclui labels e atributos `aria-label` em areas importantes.

## Melhorias recomendadas

- Fixar versoes concretas de `electron` e `electron-builder` no `package.json` em vez de usar `latest`.
- Adicionar scripts de qualidade, como `lint` e `format`, para manter um estilo consistente.
- Adicionar uma verificacao de erro ao carregar imagens, por exemplo com `imageAsset.onerror`.
- Validar se os elementos principais existem antes de registar eventos, para facilitar manutencao futura.
- Considerar separar `script.js` em modulos se o projeto crescer.
- Adicionar testes manuais documentados ou testes automatizados para fluxos principais.
- Adicionar metadados como `author` e `license` ao `package.json`.
- Definir um icone proprio para a aplicacao no build do Electron.
- Criar `.gitignore` caso o projeto passe a usar Git, ignorando `node_modules/` e `dist/`.

## Notas

Este projeto e um prototipo local. As imagens carregadas sao lidas a partir do computador do utilizador atraves de URLs temporarios criados pelo navegador, sem envio para servidores externos.
