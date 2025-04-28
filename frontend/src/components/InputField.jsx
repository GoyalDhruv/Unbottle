import { FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react";
import { useState } from "react";

export const InputField = ({ isRequired = false, name, type, label, placeholder, value, onChange, error, submitted }) => {
    const [isTouched, setIsTouched] = useState(false);

    const handleBlur = () => {
        setIsTouched(true);
    };

    const shouldShowError = (isTouched || submitted) && error && isRequired;

    return (
        <FormControl isInvalid={shouldShowError} className="!mb-6">
            <FormLabel>{label}</FormLabel>
            <Input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onBlur={handleBlur}
                className='!rounded-2xl'
            />
            {shouldShowError &&
                <FormErrorMessage className="text-red-500 absolute top-16">{error}</FormErrorMessage>
            }
        </FormControl>
    );
};
