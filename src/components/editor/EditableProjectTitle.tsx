import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Pencil } from 'lucide-react';

interface EditableProjectTitleProps {
  initialTitle: string;
  onSave: (newTitle: string) => void;
}

export const EditableProjectTitle = ({ initialTitle, onSave }: EditableProjectTitleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);

  const handleSave = () => {
    if (title.trim() && title !== initialTitle) {
      onSave(title);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="text-2xl font-bold h-10"
          autoFocus
        />
        <Button size="icon" onClick={handleSave}>
          <Check className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 group">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Pencil className="w-5 h-5" />
      </Button>
    </div>
  );
};