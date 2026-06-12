# Estatistica Aplicada a Biossistemas

Site estatico em HTML, CSS e JavaScript para estudo de Estatistica Aplicada a Biossistemas. O conteudo cobre valor de p, escolha de testes estatisticos, dados parametricos e nao parametricos, principios dos dados razoaveis e formulacao de hipoteses nulas e alternativas.

## Como abrir localmente

1. Abra um terminal nesta pasta.
2. Execute:

```bash
python -m http.server 8000
```

3. Acesse:

```text
http://localhost:8000
```

## Arquivos

- `index.html`: estrutura do site, conteudo teorico e areas de exercicios.
- `style.css`: layout responsivo, cards, tabelas, filtros e blocos de codigo.
- `app.js`: leitura do CSV, filtros, contador, gabarito, explicacao, modo simulado e modo revisao.
- `questoes_exemplo.csv`: base inicial com 25 questoes ativas.
- `README.md`: instrucoes de uso e manutencao.

## Como editar o CSV

Cada linha representa uma questao. O site carrega apenas linhas com `ativo` igual a `SIM`.

Colunas obrigatorias:

```text
id, ativo, modulo, assunto, nivel, tipo_questao, enunciado, contexto_biossistemas, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, resposta_correta, explicacao, codigo_r, saida_esperada_r, tags, fonte, link_fonte, observacao_direitos, data_inclusao, revisado, ordem
```

## Como conectar futuramente a uma planilha Google publicada como CSV

1. Na planilha Google, mantenha a primeira linha com os mesmos cabecalhos do CSV.
2. Publique a aba como CSV em `Arquivo > Compartilhar > Publicar na Web`.
3. Copie o link CSV publicado.
4. Em `app.js`, substitua:

```js
const CSV_URL = "questoes_exemplo.csv";
```

por:

```js
const CSV_URL = "URL_PUBLICADA_DA_PLANILHA_EM_CSV";
```

Enquanto a planilha nao estiver publicada na Web, o site deve usar `questoes_exemplo.csv` local.

## Como adicionar novas questoes

1. Crie um `id` unico.
2. Preencha `ativo` com `SIM`.
3. Informe `modulo` de 1 a 5.
4. Preencha `assunto`, `nivel`, `tipo_questao`, `enunciado` e `contexto_biossistemas`.
5. Para multipla escolha, preencha as alternativas A a E e a letra correta em `resposta_correta`.
6. Para discursiva, deixe alternativas vazias e escreva o criterio de resposta em `resposta_correta`.
7. Preencha `explicacao` com comentario didatico.
8. Use `codigo_r` e `saida_esperada_r` quando a questao envolver interpretacao de R.
9. Preencha `fonte`, `link_fonte` e `observacao_direitos`.
10. Use `revisado = SIM` apenas depois da conferencia do gabarito.

## Como revisar gabaritos

1. Use o filtro `Modo > Revisao` para listar questoes ainda nao revisadas.
2. Confira enunciado, alternativas, resposta correta e explicacao.
3. Execute o codigo R quando houver bloco em `codigo_r`.
4. Atualize `revisado` para `SIM` somente apos a verificacao.

## Como adaptar para nova prova

1. Troque ou acrescente questoes no CSV ou na planilha.
2. Ajuste os filtros de `assunto`, `nivel` e `tipo_questao` nas linhas novas.
3. Mantenha os cinco modulos como estrutura minima.
4. Inclua exemplos aplicados ao contexto da prova, como crescimento vegetal, irrigacao, qualidade da agua, solo, clima, biomassa, ambiente construido e sistemas produtivos.

## Limitacoes do site estatico

- O site nao grava respostas do estudante.
- O modo simulado e local, sem persistencia.
- A atualizacao automatica por Google Sheets depende de a planilha estar publicada como CSV.
- Sem servidor proprio, nao ha controle de login, historico individual ou banco de dados.

## Fontes de apoio

O conteudo foi elaborado de forma autoral, com apoio conceitual verificado em paginas de categorias e artigos do site Estatistica Facil, incluindo areas de teste t, ANOVA, teste de normalidade, qui-quadrado, correlacao e tamanho de efeito. Nao foram copiadas questoes protegidas por direitos autorais.
