interface ButtonProps {
     id: string;
     onClick: () => void;
     label: string;
     color?: string
};
export default function Button({id,onClick,label,color = "btn-primary"} : ButtonProps) {
   return (
       <button id={id}
               className={"btn ".concat(color)}
               onClick={onClick}>{label}</button>
   )
}