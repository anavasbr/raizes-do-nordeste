# Raízes do Nordeste — front-end
Abra docs/index.html em um navegador moderno ou sirva a pasta docs em uma hospedagem estática HTTPS. Todas as imagens e scripts são locais. Para servir localmente: python -m http.server 8463 --directory docs.

Escolha Recife, adicione quatro cuscuzes, revise o pedido pelo aplicativo e marque a participação no clube. Simule uma recusa e em seguida aprove. Em Operação avance o pedido, em Pedidos acompanhe a retirada. No próximo pedido o saldo de 51 pontos libera 5% de desconto.

O protótipo usa apenas dados fictícios e registra suas alterações no armazenamento local do navegador. O perfil de operação é demonstrativo. Os canais compartilham o dispositivo da demonstração. Use um perfil novo para reiniciar. O painel não exige senha. Não use dados de clientes reais.

## Arquivos
docs/model.js contém catálogo e regras. docs/app.js controla as telas. docs/style.css define o layout. docs/img contém a logo transparente e as ilustrações do redesenho artesanal. docs/fontes inclui a fonte e sua licença. tests/regras.cjs testa o modelo e interações dos controladores em Node, sem dependências. tests/fluxos.py é o roteiro adicional de navegador, para execução em máquina com Chromium e Playwright para Python.

## Testes executados
Os carimbos da interface seguem Anotado, Na brasa, Prontinho pra retirar e Entregue. Na raiz, execute node tests/regras.cjs e node tests/interacoes.cjs. Os arquivos resultado.txt e interacoes.txt registram a execução de referência. Para a suíte complementar, sirva docs no endereço indicado acima e execute o script Python após instalar Playwright e disponibilizar Chromium (configure CHROMIUM para o caminho do executável). Os cenários de navegador são complementares aos testes de lógica e de eventos.
## Publicação
No GitHub Pages, use Deploy from a branch, branch main e pasta /docs. O index.html e todos os recursos do site estão em docs.
