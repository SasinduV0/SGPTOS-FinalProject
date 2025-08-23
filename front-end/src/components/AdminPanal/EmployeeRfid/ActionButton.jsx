import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const ActionButton = ({ onEdit, onDelete, editTooltip = "Edit", deleteTooltip = "Delete" }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onEdit}
        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
        title={editTooltip}
      >
        <Edit size={16} />
      </button>
      <button
        onClick={onDelete}
        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
        title={deleteTooltip}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default ActionButton;