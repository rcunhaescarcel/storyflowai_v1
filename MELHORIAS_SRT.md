# Melhorias para Arquivos SRT

## Problemas Identificados

1. **Fontes incompatíveis** - FFmpeg não conseguia renderizar fontes personalizadas
2. **Formato SRT** - Possíveis problemas de codificação ou formato
3. **Filtros FFmpeg** - O filtro `subtitles` pode não funcionar em todos os casos

## Soluções Implementadas

### 1. Validação de Formato SRT
```typescript
const validateSRTContent = (srtText: string): boolean => {
  // Verifica se o arquivo tem:
  // - Números de sequência
  // - Timestamps (formato 00:00:00,000 --> 00:00:00,000)
  // - Texto das legendas
}
```

### 2. Conversão SRT → ASS
Criamos uma função que converte automaticamente arquivos SRT para formato ASS:

```typescript
const convertSRTtoASS = (srtText: string, scene: Scene): string => {
  // Converte timestamps SRT para ASS
  // Aplica estilos de fonte compatíveis
  // Mantém formatação e quebras de linha
}
```

### 3. Sistema de Fallback
- **Primeiro**: Tenta usar arquivo ASS convertido (mais confiável)
- **Segundo**: Usa filtro `subtitles` com arquivo SRT original
- **Terceiro**: Usa legenda manual se disponível

### 4. Logs Detalhados
Adicionamos logs específicos para rastrear:
- ✅ Validação do formato SRT
- 📄 Conteúdo do arquivo (primeiros 200 caracteres)
- 🔤 Conversão de fontes
- 🎬 Filtros aplicados

## Como Testar

### 1. Arquivo SRT Válido
Use o arquivo `exemplo.srt` criado:
```
1
00:00:00,000 --> 00:00:05,000
Esta é uma legenda de exemplo para testar o sistema.
```

### 2. Passos para Teste
1. **Acesse o Editor** (`http://localhost:8080/editor`)
2. **Crie uma nova cena**
3. **Faça upload do arquivo SRT** (`exemplo.srt`)
4. **Configure a fonte** (todas são compatíveis agora)
5. **Renderize o vídeo**
6. **Verifique os logs** para ver o processo

### 3. Verificação dos Logs
Procure por estas mensagens nos logs:
```
📝 Escrevendo arquivo SRT para cena 0
✅ Formato SRT válido: true
✅ Arquivo ASS criado como backup
✅ Usando arquivo ASS como backup para legenda
```

## Formatos Suportados

### SRT (SubRip)
```
1
00:00:00,000 --> 00:00:05,000
Texto da legenda

2
00:00:05,000 --> 00:00:10,000
Outra legenda
```

### ASS (Advanced SubStation Alpha)
```
[Script Info]
Title: Viflow IA Subtitle
ScriptType: v4.00+

[V4+ Styles]
Style: Default,Arial,24,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Dialogue: 0,0:00:00.00,0:00:05.00,Default,,0,0,0,,Texto da legenda
```

## Troubleshooting

### Se as legendas não aparecerem:
1. **Verifique os logs** - Procure por erros específicos
2. **Teste com arquivo exemplo** - Use `exemplo.srt`
3. **Verifique formato** - Certifique-se que o SRT está correto
4. **Tente fonte diferente** - Use "Arial" que é mais compatível

### Logs importantes:
- `✅ Formato SRT válido: true` - Arquivo está correto
- `✅ Arquivo ASS criado como backup` - Conversão funcionou
- `✅ Usando arquivo ASS como backup` - Usando método mais confiável
