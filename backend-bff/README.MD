# Biobox - API Gateway (BFF)

Middleware de seguridad y orquestación para el visor DICOM de Biobox. Este servicio actúa como escudo entre el cliente web (público) y la infraestructura médica (privada).

##  Arquitectura
- **Patrón:** Backend for Frontend (BFF)
- **Lenguaje:** Node.js + TypeScript
- **Seguridad:** Helmet, CORS restringido, Validación de Tokens (WIP)
- **Integración:** Conexión nativa con Orthanc PACS vía API REST


[![](https://mermaid.ink/img/pako:eNqNVm1v2kgQ_iujrSoRnaHYYF6cUyUHSBsdBIrTVEqpTou9hk2Ml1vbSUmUX9Vv_do_drN-AQe4S9cS9g7zeJ6dmWfXT8QVHiMWWUi6XsJwOgsBx9u3UK1WYeBcXQzHDvTt6V8wGvcHUOkJKdmCeyI6US5b917AWRgzC-zHJIBL4S4ZuCKEuZAeg96GhpmrG9Ao6jMfHxQAfB4E1ps61buGr0WxFHcMp3Wv6RfT6gP34qVlrL9rrgiEtN6wut_26eks3EZ3lpwFngXXTEUbR24iRSn8kK_oXvgoRRThTYPprVJ43-96L8M3S-E7vsm65fDXNAliC6biVhwGT61nEgNRTNAejXuFzFkY87pZN7csfN80TOM_k-D7bM5YmcWQLai7seCD5NEhjUlA4_0kBCmiCK-raxu-y9R1GD43eDRaUikpxjPBLEjNPXWVSQ2imAcCbkRIIwvORegJEDk3GnEI2UKKPVqPImRRzkpPx5ZVKx0vWenlpKhxhGMDGmVWeXNPP_euPk_tXSNHyTwTwiSZB9z9G2kz-Dojij5Mfv1URgqVCyykDFl8MiPfMqAaHpfMjTlm_OpsZz2T4iFisjIjcM0jIeELm0Nlyqir4CeWZWVK2CHs9Vp54w1Gv37c8wAq50mMGTviz0KvWNaWe39085K4wxaJpPAOPtCYPdDNb7C2JxfIAX8LzJ9z-e595RI3i9ptBH_AlZOzyYRUQibxUkHxBiPueQGiJTvuOxSLRZoaO_F4nE8PXY8tciL5PTLbq5AyeligjyJa85gGv1OgsYyXNHS_qpxP7J5TGLIV94V7x6Ra6zdklcq1xD_VT4rMHqF_lntm0jrgj71nr1UTSWCZMihg26MWbvEXZfqohFLSQ7kTtaKy2ovVp3LZ7-7pYGj3LsaXA2fX3XkrogFmRK-pfPMQ22LK_kmQDa6iWn2vSp-5qwas1gpLbsOOSOFGTW223Fd6uEKxhQUa677n2kgjJYzmLnmZ99_YrMEXuz-uTp3cL69Dya2GbmYNnE9D-JQwiY0Mit8wz_XRs-t8OOh9tEtZCHh458SbgEFd0-GVI-d0H2NoDfi_c-IYpgmv7OkHCBNe2YZPiYZHNveIFcuEaWTF5IqqKXlS75qReMlWqDoLHz0q72ZkFj4jZk3DGyFWBUyKZLEklk-DCGfJ2sOm6nOKEtu5YPcy2RNJGBOrYZjpO4j1RL4Tq92qNRsN3WzpuKxGq2toZEMsvdWqdZpmq9vttJsd_K_9rJHHNGq91uo0TL3TrrfbpmEY7Y5GGEpfyFH2GZJ-jTz_CykFqaQ?type=png)](https://mermaid.live/edit#pako:eNqNVm1v2kgQ_iujrSoRnaHYYF6cUyUHSBsdBIrTVEqpTou9hk2Ml1vbSUmUX9Vv_do_drN-AQe4S9cS9g7zeJ6dmWfXT8QVHiMWWUi6XsJwOgsBx9u3UK1WYeBcXQzHDvTt6V8wGvcHUOkJKdmCeyI6US5b917AWRgzC-zHJIBL4S4ZuCKEuZAeg96GhpmrG9Ao6jMfHxQAfB4E1ps61buGr0WxFHcMp3Wv6RfT6gP34qVlrL9rrgiEtN6wut_26eks3EZ3lpwFngXXTEUbR24iRSn8kK_oXvgoRRThTYPprVJ43-96L8M3S-E7vsm65fDXNAliC6biVhwGT61nEgNRTNAejXuFzFkY87pZN7csfN80TOM_k-D7bM5YmcWQLai7seCD5NEhjUlA4_0kBCmiCK-raxu-y9R1GD43eDRaUikpxjPBLEjNPXWVSQ2imAcCbkRIIwvORegJEDk3GnEI2UKKPVqPImRRzkpPx5ZVKx0vWenlpKhxhGMDGmVWeXNPP_euPk_tXSNHyTwTwiSZB9z9G2kz-Dojij5Mfv1URgqVCyykDFl8MiPfMqAaHpfMjTlm_OpsZz2T4iFisjIjcM0jIeELm0Nlyqir4CeWZWVK2CHs9Vp54w1Gv37c8wAq50mMGTviz0KvWNaWe39085K4wxaJpPAOPtCYPdDNb7C2JxfIAX8LzJ9z-e595RI3i9ptBH_AlZOzyYRUQibxUkHxBiPueQGiJTvuOxSLRZoaO_F4nE8PXY8tciL5PTLbq5AyeligjyJa85gGv1OgsYyXNHS_qpxP7J5TGLIV94V7x6Ra6zdklcq1xD_VT4rMHqF_lntm0jrgj71nr1UTSWCZMihg26MWbvEXZfqohFLSQ7kTtaKy2ovVp3LZ7-7pYGj3LsaXA2fX3XkrogFmRK-pfPMQ22LK_kmQDa6iWn2vSp-5qwas1gpLbsOOSOFGTW223Fd6uEKxhQUa677n2kgjJYzmLnmZ99_YrMEXuz-uTp3cL69Dya2GbmYNnE9D-JQwiY0Mit8wz_XRs-t8OOh9tEtZCHh458SbgEFd0-GVI-d0H2NoDfi_c-IYpgmv7OkHCBNe2YZPiYZHNveIFcuEaWTF5IqqKXlS75qReMlWqDoLHz0q72ZkFj4jZk3DGyFWBUyKZLEklk-DCGfJ2sOm6nOKEtu5YPcy2RNJGBOrYZjpO4j1RL4Tq92qNRsN3WzpuKxGq2toZEMsvdWqdZpmq9vttJsd_K_9rJHHNGq91uo0TL3TrrfbpmEY7Y5GGEpfyFH2GZJ-jTz_CykFqaQ)

##  Stack Tecnológico
- **Runtime:** Node.js v20+
- **Framework:** Express
- **Cliente HTTP:** Axios (con interceptores)
- **Logger:** Morgan

##  Endpoints Principales

### Sistema
- `GET /api/health`
  - *Verifica el estado del Gateway y la conexión a internet.*

### PACS (Imágenes Médicas)
- `GET /api/pacs/system`
  - *Devuelve información del servidor Orthanc conectado (versión, almacenamiento).*
- `GET /api/pacs/patients`
  - *Lista los pacientes indexados en la base de datos médica.*

##  Instalación y Uso

1. **Requisitos Previos**
   - Docker Desktop corriendo (para Orthanc)
   - Node.js instalado

2. **Levantar Infraestructura**
   ```bash
   cd infrastructure
   docker-compose up -d
    ```

2. **Iniciar Gateway**
   ```bash
   cd backend-bff
   npm install
   npm run dev
   ```




