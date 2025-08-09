import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette } from "lucide-react";
import { storyStyles, openAIVoices, languages } from '@/lib/constants';

interface DefaultPreferencesCardProps {
  preferredLanguage: string;
  setPreferredLanguage: (value: string) => void;
  preferredVoice: string;
  setPreferredVoice: (value: string) => void;
  preferredStyle: string;
  setPreferredStyle: (value: string) => void;
  preferredDuration: string;
  setPreferredDuration: (value: string) => void;
}

export const DefaultPreferencesCard = ({
  preferredLanguage, setPreferredLanguage,
  preferredVoice, setPreferredVoice,
  preferredStyle, setPreferredStyle,
  preferredDuration, setPreferredDuration,
}: DefaultPreferencesCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <Palette className="w-6 h-6 text-primary" />
          Preferências Padrão
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Idioma padrão da conta</Label>
          <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(languages).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Voz preferida</Label>
          <Select value={preferredVoice} onValueChange={setPreferredVoice}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {openAIVoices.map(voice => (
                <SelectItem key={voice.value} value={voice.value}>{voice.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Estilo visual padrão</Label>
          <Select value={preferredStyle} onValueChange={setPreferredStyle}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(storyStyles).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Duração padrão</Label>
          <Select value={preferredDuration} onValueChange={setPreferredDuration}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 segundos</SelectItem>
              <SelectItem value="60">1 minuto</SelectItem>
              <SelectItem value="90">1 minuto e 30s</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};