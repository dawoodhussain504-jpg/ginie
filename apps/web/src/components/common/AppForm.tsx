'use client';

import React from 'react';
import { Form } from 'antd';
import type { FormProps, FormInstance } from 'antd';

export interface AppFormProps<Values = any> extends FormProps<Values> {
  form?: FormInstance<Values>;
  children: React.ReactNode;
}

export function AppForm<Values = any>({
  form,
  layout = 'vertical',
  requiredMark = true,
  onFinishFailed,
  children,
  className = '',
  ...restProps
}: AppFormProps<Values>) {
  const handleFinishFailed = (errorInfo: any) => {
    // Automatically scroll to and focus the first invalid input
    if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
      const firstField = errorInfo.errorFields[0].name;
      form?.scrollToField(firstField, { behavior: 'smooth', block: 'center' });
      const fieldName = Array.isArray(firstField) ? firstField.join('_') : firstField;
      const element = document.getElementById(`${fieldName}`) || document.querySelector(`[name="${fieldName}"]`);
      if (element && typeof (element as any).focus === 'function') {
        (element as any).focus();
      }
    }
    onFinishFailed?.(errorInfo);
  };

  return (
    <Form<Values>
      form={form}
      layout={layout}
      requiredMark={requiredMark}
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
      onFinishFailed={handleFinishFailed}
      className={`app-form ${className}`}
      {...restProps}
    >
      {children}
    </Form>
  );
}

AppForm.Item = Form.Item;
AppForm.useForm = Form.useForm;
AppForm.useWatch = Form.useWatch;

export default AppForm;
