interface InputNumberProps {
     value: number;
     onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
     label: string;
     name: string;
}
export default function InputNumber({name,value,onChange,label}: InputNumberProps) {
    return (
        <>
            <label className={"form-label"}
                   htmlFor={name}>{label}: </label>
            <input type={"number"}
                   className={"form-control"}
                   id={name}
                   name={name}
                   onChange={onChange}
                   value={value}/>
        </>
    )
}