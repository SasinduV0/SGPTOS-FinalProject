import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const ActionButton = ({ onEdit, onDelete, editTooltip, deleteTooltip }) => {
  return (
    <div className="flex space-x-2">
      <button
        onClick={onEdit}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        title={editTooltip}
      >
        <Edit size={18} />
      </button>
      <button
        onClick={onDelete}
        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
        title={deleteTooltip}
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default ActionButton;