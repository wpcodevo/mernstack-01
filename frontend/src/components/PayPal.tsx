import React, { FC, useCallback, useEffect, useRef } from 'react';

type IPayPalProps = {
  currency?: string;
  amount: number;
  onSuccess: (paymentResult: any) => any;
};

const PayPal: FC<IPayPalProps> = ({ currency, amount, onSuccess }) => {
  const paypal = useRef<HTMLDivElement | null>(null);

  const onSuccessHandler = useCallback(
    (data: any) => {
      onSuccess(data);
    },
    [onSuccess]
  );

  useEffect(() => {
    (window as any).paypal
      .Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: currency || 'USD',
                  value: amount.toString(),
                },
              },
            ],
          });
        },
        onApprove: async (data: any, actions: any) => {
          const order = await actions.order.capture();
          onSuccessHandler(order);
        },
        onError: (err: any) => {
          throw new Error(err);
        },
      })
      .render(paypal.current);
  }, [amount, currency, onSuccessHandler]);

  return (
    <div>
      <div ref={paypal}></div>
    </div>
  );
};

export default PayPal;
