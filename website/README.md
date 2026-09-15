# Cloud Cost Calculator

Site estático que estima o custo mensal de infraestrutura no Azure a partir de
tipo de VM, storage, tipo de disco e quantidade de instâncias. Feito com
HTML, CSS e JavaScript puro — sem build step, sem dependências.

## Rodando localmente

Basta abrir `index.html` no navegador, ou servir a pasta com qualquer
servidor estático:

```bash
python3 -m http.server 8000
```

## Ajustando os preços

Os valores de referência (USD por hora/GB) e a cotação USD→BRL ficam no topo
de `script.js` e são editáveis diretamente na interface. Eles representam
preços públicos de lista (pay-as-you-go, sem região específica) — ajuste
conforme a região e o momento que quiser refletir.

## Próximos passos possíveis

- Consumir a [Azure Retail Prices API](https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices/azure-retail-prices)
  para preços em tempo real, em vez da tabela fixa.
- Adicionar mais séries de VM (D, E, F) e outros provedores (AWS, GCP).
- Exportar cenários salvos em CSV.
