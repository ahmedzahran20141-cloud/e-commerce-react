import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";


function InvoicePDF({ order }) {


  const downloadInvoice = async () => {


    const doc = new jsPDF();



    // ================= Logo =================

    const logo = new Image();

    logo.src = "https://i.ibb.co/8D3C7KhK/E-Commerce.png";

    logo.onload = () => {

        doc.addImage(
            logo,
            "PNG",
            15,
            10,
            25,
            25
        );

    };



    // ================= Header =================

    doc.setFontSize(20);

    doc.text(
      "Ahmed Zahran Store",
      50,
      20
    );


    doc.setFontSize(11);

    doc.text(
      "Professional Ecommerce Invoice",
      50,
      28
    );


    doc.line(
      15,
      40,
      195,
      40
    );




    // ================= Order Info =================


    doc.setFontSize(12);


    doc.text(
      `Invoice ID: ${order._id}`,
      15,
      55
    );


    doc.text(
      `Date: ${new Date(order.date).toLocaleDateString()}`,
      15,
      63
    );


    doc.text(
      `Customer: ${order.userEmail}`,
      15,
      71
    );


    doc.text(
      `Payment: ${order.method}`,
      15,
      79
    );

    doc.text(
      `Status: ${order.status || "Pending"}`,
      15,
      87
    );


    if(order.paymentId){

      doc.text(
        `Stripe ID: ${order.paymentId}`,
        15,
        95
      );

    }




    // ================= QR Code =================


    const qrData = "https://i.ibb.co/XxmbT5BZ/Welcome-To-E-Commerce.jpg";



    const qrImage =
      await QRCode.toDataURL(qrData);



    doc.addImage(

      qrImage,

      "PNG",

      155,

      50,

      35,

      35

    );



    doc.setFontSize(9);

    doc.text(
      "Scan Order",
      160,
      90
    );






    // ================= Products Table =================


    autoTable(doc, {


      startY:105,


      head:[

        [
          "Product",
          "Price",
          "Qty",
          "Total"
        ]

      ],



      body:

      order.items.map(item=>[

        item.title,

        `$${item.price}`,

        item.quantity,

        `$${(
          item.price *
          item.quantity
        ).toFixed(2)}`

      ]),



    });






    let y =
      doc.lastAutoTable.finalY + 15;




    // ================= VAT =================


    const subtotal =
      Number(order.total);



    const vat =
      subtotal * 0.15;



    const grandTotal =
      subtotal + vat;



    doc.text(
      `Subtotal: $${subtotal.toFixed(2)}`,
      140,
      y
    );


    doc.text(
      `VAT (15%): $${vat.toFixed(2)}`,
      140,
      y + 8
    );


    doc.setFontSize(14);

    doc.text(
      `Total: $${grandTotal.toFixed(2)}`,
      140,
      y + 18
    );






    // ================= Shipping =================


    y += 40;


    doc.setFontSize(11);


    doc.text(
      "Shipping Information",
      15,
      y
    );


    doc.text(
      `Carrier: ${order.carrier || "N/A"}`,
      15,
      y + 8
    );


    doc.text(
      `Tracking: ${order.trackingNumber || "N/A"}`,
      15,
      y + 16
    );


    doc.text(
      `Delivery: ${order.estimatedDelivery || "N/A"}`,
      15,
      y + 24
    );

    // ================= Order Info =================

    doc.setFontSize(12);


    doc.text(
      `Invoice ID: ${order._id}`,
      15,
      55
    );


    doc.text(
      `Date: ${new Date(order.date).toLocaleDateString()}`,
      15,
      63
    );


    doc.text(
      `Customer: ${order.userEmail}`,
      15,
      71
    );


    doc.text(
      `Payment: ${order.method}`,
      15,
      79
    );


    doc.text(
      `Status: ${order.status || "Pending"}`,
      15,
      87
    );



    if(order.paymentId){

      doc.text(
        `Stripe ID: ${order.paymentId}`,
        15,
        95
      );

    }






    // ================= Footer =================


    doc.line(
      15,
      280,
      195,
      280
    );


    doc.setFontSize(9);


    doc.text(
      "Thank you for shopping with Ahmed Zahran Store",
      15,
      290
    );


    doc.text(
      "support@ahmedzahran.com",
      15,
      296
    );



    doc.save(
      `Invoice-${order._id}.pdf`
    );


  };





  return (

    <button
      className="btn btn-dark"
      onClick={downloadInvoice}
    >

      📄 Download Invoice

    </button>

  );


}


export default InvoicePDF;