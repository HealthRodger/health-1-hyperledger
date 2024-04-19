import * as React from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';

/**
 * Title is a React component that renders a typographic element styled as a title. 
 * This component is used to display section headers or titles in the UI, using Material-UI's Typography component.
 * It accepts children as a prop, which allows for flexible content insertion, such as text or other React elements.
 *
 * @component
 * @param {Object} props - The props for the component.
 * @param {React.ReactNode} props.children - The content to be displayed within the title component. This can be a string, 
 * element, or any React node.
 * @returns {React.ReactElement} A Typography component styled as a primary-colored header, which makes it stand out as a section title.
 */
function Title(props) {
  return (
    <Typography component="h2" variant="h6" color="primary" gutterBottom>
      {props.children}
    </Typography>
  );
}

Title.propTypes = {
  children: PropTypes.node,
};

export default Title;
