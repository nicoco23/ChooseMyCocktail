import React from 'react';
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import "../css/input.css";
function FilterSection({ options, selectedOptions, onChange }) {
    const handleChange = (event, value) => {
        onChange(value);
    };

    return (
        <Autocomplete
            multiple
            options={options}
            value={selectedOptions}
            onChange={handleChange}
            renderInput={(params) => (
                <TextField {...params} className="searchbar" variant="outlined" label="Alcool" placeholder="Choisissez un alcool..." />
            )}
        />
    );
}

export default FilterSection;