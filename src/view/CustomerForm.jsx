import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from './styles.module.css'; // Assuming the CSS above is saved as styles.module.css

const CustomerForm = () => {
  const [customers, setCustomers] = useState([]); // Store customers data
  const [selectedCustomer, setSelectedCustomer] = useState(null); // Store selected customer for update
  const [imagePreview, setImagePreview] = useState(null); // Preview image
  const [videoPreview, setVideoPreview] = useState(null); // Preview video

  // Validation schema using Yup
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    country: Yup.string().required('Country is required'),
    termsAndConditions: Yup.boolean().oneOf([true], 'Accept Terms & Conditions is required'),
  });

  // GET: Fetch all customers
  const fetchCustomers = async () => {
    try {
      const response = await axios.get('https://customer-form-api.onrender.com/api/customers');
      setCustomers(response.data); // Set customers data
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const form = new FormData();
    form.append('name', values.name);
    form.append('email', values.email);
    form.append('phone', values.phone);
    form.append('address[city]', values.city);
    form.append('address[state]', values.state);
    form.append('address[country]', values.country);
    form.append('termsAndConditions', values.termsAndConditions);

    if (values.image) {
      form.append('image', values.image);
    }
    if (values.video) {
      form.append('video', values.video);
    }

    try {
      if (selectedCustomer) {
        // Update customer
        await axios.put(`https://customer-form-api.onrender.com/api/customers/${selectedCustomer._id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Customer updated successfully!');
        setSelectedCustomer(null);
      } else {
        // Create customer
        await axios.post('https://customer-form-api.onrender.com/api/customers', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Customer created successfully!');
      }
      fetchCustomers(); // Refresh customer list after submission
      resetForm();
      setImagePreview(null); // Reset image preview
      setVideoPreview(null); // Reset video preview
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error saving customer.');
    }
    setSubmitting(false);
  };

  // DELETE: Delete a customer
  const deleteCustomer = async (customerId) => {
    try {
      await axios.delete(`https://customer-form-api.onrender.com/api/customers/${customerId}`);
      alert('Customer deleted successfully!');
      fetchCustomers(); // Refresh customer list after deletion
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error deleting customer.');
    }
  };

  // SELECT customer to update
  const selectCustomerForUpdate = (customer) => {
    setSelectedCustomer(customer);
  };

  // Handle image and video previews
  const handleImageChange = (event, setFieldValue) => {
    const file = event.target.files[0];
    setFieldValue('image', file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (event, setFieldValue) => {
    const file = event.target.files[0];
    setFieldValue('video', file);
    setVideoPreview(URL.createObjectURL(file));
  };

  return (
    <div className={styles.container}>
      <h2>{selectedCustomer ? 'Update Customer' : 'Create Customer'}</h2>

      <Formik
        initialValues={{
          name: selectedCustomer ? selectedCustomer.name : '',
          email: selectedCustomer ? selectedCustomer.email : '',
          phone: selectedCustomer ? selectedCustomer.phone : '',
          city: selectedCustomer ? selectedCustomer.address.city : 'New York',
          state: selectedCustomer ? selectedCustomer.address.state : 'NY',
          country: selectedCustomer ? selectedCustomer.address.country : 'USA',
          termsAndConditions: false,
          image: null,
          video: null,
        }}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form encType="multipart/form-data">
            <div>
              <label>Name:</label>
              <Field type="text" name="name" />
              <ErrorMessage name="name" component="div" className={styles.error} />
            </div>

            <div>
              <label>Email:</label>
              <Field type="email" name="email" />
              <ErrorMessage name="email" component="div" className={styles.error} />
            </div>

            <div>
              <label>Phone:</label>
              <Field type="tel" name="phone" />
              <ErrorMessage name="phone" component="div" className={styles.error} />
            </div>

            <div>
              <label>City:</label>
              <Field as="select" name="city">
                <option value="New York">New York</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="Chicago">Chicago</option>
              </Field>
              <ErrorMessage name="city" component="div" className={styles.error} />
            </div>

            <div>
              <label>State:</label>
              <Field as="select" name="state">
                <option value="NY">NY</option>
                <option value="CA">CA</option>
                <option value="IL">IL</option>
              </Field>
              <ErrorMessage name="state" component="div" className={styles.error} />
            </div>

            <div>
              <label>Country:</label>
              <Field as="select" name="country">
                <option value="USA">USA</option>
                <option value="Canada">Canada</option>
                <option value="Mexico">Mexico</option>
              </Field>
              <ErrorMessage name="country" component="div" className={styles.error} />
            </div>

            <div>
              <label>Upload Image (max 5MB):</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={(event) => handleImageChange(event, setFieldValue)}
              />
              {imagePreview && (
                <div className={styles.preview}>
                  <p>Image Preview:</p>
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>

            <div>
              <label>Upload Introduction Video (max 15MB):</label>
              <input
                type="file"
                name="video"
                accept="video/*"
                onChange={(event) => handleVideoChange(event, setFieldValue)}
              />
              {videoPreview && (
                <div className={styles.preview}>
                  <p>Video Preview:</p>
                  <video controls>
                    <source src={videoPreview} type="video/mp4" />
                  </video>
                </div>
              )}
            </div>

            <div>
              <label>
                <Field type="checkbox" name="termsAndConditions" /> Accept Terms and Conditions
              </label>
              <ErrorMessage name="termsAndConditions" component="div" className={styles.error} />
            </div>

            <button type="submit" disabled={isSubmitting}>
              {selectedCustomer ? 'Update' : 'Submit'}
            </button>
          </Form>
        )}
      </Formik>

      {/* List of Customers */}
      <h3>Customer List</h3>
      <ul className={styles.customerList}>
        {customers.map((customer) => (
          <li key={customer._id} className={styles.customerItem}>
            <p>
              <strong>Name:</strong> {customer.name}
            </p>
            <p>
              <strong>Email:</strong> {customer.email}
            </p>
            <p>
              <strong>Phone:</strong> {customer.phone}
            </p>
            <p>
              <strong>City:</strong> {customer.address.city}, {customer.address.state}, {customer.address.country}
            </p>

            {/* Image Preview */}
            {customer.imageUrl && (
              <div className={styles.imagePreview}>
                <p><strong>Image Preview:</strong></p>
                <img src={customer.imageUrl} alt={`${customer.name}'s profile`} className={styles.previewImage} />
              </div>
            )}

            {/* Video Preview */}
            {customer.videoUrl && (
              <div className={styles.videoPreview}>
                <p><strong>Video Preview:</strong></p>
                <video controls className={styles.previewVideo}>
                  <source src={customer.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            <div>
              <button onClick={() => selectCustomerForUpdate(customer)}>Edit</button>
              <button onClick={() => deleteCustomer(customer._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default CustomerForm;
