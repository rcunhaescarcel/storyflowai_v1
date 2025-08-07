# Correção das Fontes das Legendas

## Problema Identificado

O FFmpeg não conseguia renderizar legendas porque estava tentando usar fontes personalizadas (como "Poppins" e "Roboto") que não estão disponíveis no ambiente do FFmpeg.

## Solução Implementada

### 1. Fontes Compatíveis
Substituímos as fontes personalizadas por fontes padrão do sistema que o FFmpeg pode renderizar:

- **Arial** (padrão)
- **Helvetica**
- **Times New Roman** → **Times**
- **Courier New** → **Courier**
- **Verdana**
- **Georgia**
- **Impact**
- **Comic Sans MS**

### 2. Mapeamento de Fontes
Criamos um sistema de mapeamento que converte automaticamente fontes personalizadas para versões compatíveis:

```typescript
const fontMap: { [key: string]: string } = {
  'Poppins': 'Arial',
  'Roboto': 'Arial',
  'Helvetica': 'Arial',
  'Times New Roman': 'Times',
  'Courier New': 'Courier',
  'Verdana': 'Arial',
  'Georgia': 'Georgia',
  'Impact': 'Impact',
  'Comic Sans MS': 'Arial'
};
```

### 3. Logs de Debug
Adicionamos logs específicos para rastrear qual fonte está sendo usada:

```
🔤 Fonte original: Poppins → Compatível: Arial
```

## Como Testar

1. **Crie uma nova cena** no editor
2. **Adicione uma legenda** com texto
3. **Selecione uma fonte** da lista (todas são compatíveis agora)
4. **Renderize o vídeo** e verifique se a legenda aparece

## Fontes Disponíveis no Seletor

- ✅ Arial
- ✅ Helvetica  
- ✅ Times New Roman
- ✅ Courier New
- ✅ Verdana
- ✅ Georgia
- ✅ Impact
- ✅ Comic Sans MS

Todas essas fontes são compatíveis com o FFmpeg e devem renderizar corretamente as legendas.
