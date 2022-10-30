import React from 'react';
import { FiTrash2 } from 'react-icons/fi';

export default function Empty() {
  return (
    <div className="flex justify-center items-center w-full flex-col text-white gap-3 font-poppins">
      <FiTrash2 className="text-[60px]" />
      <span className="text-[30px] font-[700]">There&apos;s nothing here</span>
    </div>
  );
}
