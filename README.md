# EnergyOS — Front-end

Dashboard web do **EnergyOS**, um sistema IoT que monitora o consumo de energia de uma casa em tempo real.

O hardware (ESP32 + sensor PZEM-004T) mede tensão, corrente, potência e energia. Esses dados vão para o back-end via MQTT, e este front-end mostra tudo em gráficos, cards e alertas.

> **Status:** a interface está pronta e já tenta buscar os dados reais na API. Enquanto o back-end não responde, ela usa dados simulados (mock), então dá para rodar e testar sem o hardware.

---

## O que ele mostra

- **Métricas em tempo real:** potência (W), tensão (V), corrente (A), frequência (Hz)
- **Consumo:** energia total, do dia e do mês (kWh), com custo estimado em R$
- **Gráficos:** potência ao longo do tempo, histórico de consumo, perfil diário e comparação mensal
- **Fluxo de energia:** rede AC → medidor PZEM → cargas
- **Status do dispositivo:** ESP32, Wi-Fi, latência do MQTT, temperatura, firmware e uptime
- **Central de alertas** e **insights de consumo**
- **Páginas de detalhe:** cada card abre uma página própria (`#/metricas/...`, `#/sessoes/...`, `#/dados/...`)

## Tecnologias

| Parte | Ferramenta |
| --- | --- |
| Interface | React 18 |
| Build e servidor local | Vite 5 |
| Gráficos | Chart.js + react-chartjs-2 |
| Ícones | Lucide React |

## Como rodar

Precisa ter o **Node.js** instalado (versão LTS).

```bash
npm install
npm run dev
```

Depois abra no navegador:

```text
http://localhost:5173
```

> Não abra o `index.html` direto nem pelo Live Server. O projeto usa Vite e só funciona rodando o comando acima.

### Gerar a versão de produção

```bash
npm run build
npm run preview
```

## Estrutura

```text
src/
├── App.jsx              # rotas por hash e tela de abertura
├── pages/               # Dashboard e páginas de detalhe
├── layouts/             # layout geral do dashboard
├── components/          # cards, status do MQTT, alertas, insights
├── charts/              # configuração dos gráficos
├── hooks/               # useEnergyTelemetry: busca os dados
├── services/            # mockEnergyService: dados simulados
└── utils/               # formatação de números e unidades
```

## Integração com o back-end

Os dados chegam pelo hook `useEnergyTelemetry`, que busca a API a cada 1,8 segundo.

| O quê | Onde |
| --- | --- |
| API REST (última leitura) | `GET /api/telemetry/latest` |
| WebSocket (planejado) | `ws://localhost:3001/energyos/live` |
| Tópico MQTT do ESP32 | `energyos/esp32/pzem004t/telemetry` |
| Banco de histórico | InfluxDB (bucket `energyos_metrics`) |

Se a API não responder, a tela continua funcionando com os dados do mock.

## Arquitetura do EnergyOS

```text
ESP32 + PZEM-004T  ──MQTT──▶  Back-end (API + InfluxDB)  ──REST──▶  Este front-end
 mede V, A, W, kWh            recebe, guarda histórico              gráficos e alertas
```

O back-end fica em outro repositório: [EnergyosBackend](https://github.com/VitorRenner/EnergyosBackend).

## Próximos passos

- [ ] Ligar no back-end real e tirar o mock
- [ ] Trocar a busca a cada 1,8 s por WebSocket
- [ ] Deploy público com link
- [ ] Prints e GIF do dashboard aqui no README

## Autor

Feito por **Vitor Rogge Renner**, estudante de Engenharia de Software, como parte do projeto EnergyOS em equipe.

[LinkedIn](https://www.linkedin.com/in/vitor-rogge-renner-5367b82b8) · [GitHub](https://github.com/VitorRenner)
