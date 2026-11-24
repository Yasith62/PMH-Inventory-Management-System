import { createPortal } from 'react-dom';
import { X, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';

const invoiceStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', system-ui, sans-serif; color: #1e293b; padding: 32px; font-size: 14px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0025ff; padding-bottom: 16px; margin-bottom: 20px; }
  .brand { font-size: 24px; font-weight: 700; color: #0025ff; }
  .meta { color: #64748b; font-size: 13px; margin-top: 4px; }
  .invoice-title { font-size: 20px; font-weight: 700; text-align: right; }
  .staff { margin-bottom: 16px; color: #475569; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { background: #f8fafc; text-align: left; padding: 10px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 2px solid #e2e8f0; }
  th.num, td.num { text-align: right; }
  td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  .item-name { font-weight: 600; }
  .item-brand { font-size: 12px; color: #64748b; margin-top: 2px; }
  .totals { margin-top: 20px; display: flex; justify-content: flex-end; }
  .totals-box { width: 280px; }
  .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
  .total-row.grand { border-top: 2px solid #e2e8f0; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: 700; }
  .total-row.grand span:last-child { color: #0025ff; }
  .footer { margin-top: 32px; text-align: center; color: #94a3b8; font-size: 12px; }
  .empty { padding: 24px; text-align: center; color: #94a3b8; }
  
  @media print {
    body { padding: 16px; }
  }
  
  @media print {
    @page {
      size: 58mm auto;
      margin: 2mm;
    }
    body {
      padding: 2mm;
      font-size: 10px;
      width: 54mm;
    }
    .header {
      flex-direction: column;
      border-bottom: 2px solid #0025ff;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .brand { font-size: 14px; }
    .meta { font-size: 8px; }
    .invoice-title { font-size: 12px; text-align: left; }
    table { margin: 8px 0; font-size: 8px; }
    th { padding: 4px 2px; font-size: 7px; }
    td { padding: 4px 2px; font-size: 8px; }
    .item-name { font-size: 8px; }
    .item-brand { font-size: 7px; }
    .totals { margin-top: 8px; }
    .totals-box { width: 100%; }
    .total-row { font-size: 9px; padding: 4px 0; }
    .total-row.grand { font-size: 11px; }
    .footer { margin-top: 8px; font-size: 7px; }
    .staff { font-size: 8px; margin-bottom: 8px; }
  }
`;

export function buildInvoiceHtml(sale) {
  const items = sale?.items ?? [];
  const subtotal = items.reduce((s, i) => s + i.quantity * Number(i.selling_price), 0);
  const total = Number(sale?.total_amount) || subtotal;

  const rows =
    items.length > 0
      ? items
          .map((item) => {
            const lineTotal = item.quantity * Number(item.selling_price);
            const listPrice = item.product_list_price != null ? Number(item.product_list_price) : null;
            const hasDiscount = listPrice != null && listPrice > Number(item.selling_price);
            return `
        <tr>
          <td>
            <div class="item-name">${item.product_name || 'Item'}</div>
            ${item.brand ? `<div class="item-brand">${item.brand}</div>` : ''}
          </td>
          <td class="num">${item.quantity}</td>
          <td class="num">${formatCurrency(item.selling_price)}</td>
          <td class="num">${hasDiscount ? formatCurrency(listPrice) : '—'}</td>
          <td class="num"><strong>${formatCurrency(lineTotal)}</strong></td>
        </tr>`;
          })
          .join('')
      : `<tr><td colspan="5" class="empty">No line items recorded for this sale.</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice #${String(sale.id).padStart(6, '0')} - PMH</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>${invoiceStyles}</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Pugoda Motor House</div>
      <p class="meta">Spare Parts · Pugoda, Sri Lanka</p>
      <p class="meta">Tel: +94 77 000 0000</p>
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <p class="meta" style="text-align:right">#${String(sale.id).padStart(6, '0')}</p>
      <p class="meta" style="text-align:right">${formatDate(sale.date)}</p>
    </div>
  </div>
  ${sale.staff_name ? `<p class="staff">Served by: <strong>${sale.staff_name}</strong></p>` : ''}
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="num">Qty</th>
        <th class="num">Unit Price</th>
        <th class="num">List Price</th>
        <th class="num">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div class="totals-box">
      <div class="total-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
      <div class="total-row grand"><span>Total</span><span>${formatCurrency(total)}</span></div>
    </div>
  </div>
  <p class="footer">Thank you for your business!</p>
</body>
</html>`;
}

/** Print using a hidden iframe (no pop-up blocker). */
function printWithIframe(sale) {
  return new Promise((resolve, reject) => {
    const html = buildInvoiceHtml(sale);
    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', 'Invoice print');
    iframe.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:0;border:0;visibility:hidden;';

    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      iframe.remove();
      reject(new Error('no iframe document'));
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    let printed = false;
    const runPrint = () => {
      if (printed) return;
      printed = true;
      try {
        const win = iframe.contentWindow;
        if (!win) throw new Error('no window');
        win.focus();
        win.print();
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        setTimeout(() => iframe.remove(), 3000);
      }
    };

    iframe.onload = () => setTimeout(runPrint, 400);
    setTimeout(runPrint, 1200);
  });
}

/** Fallback: print the on-screen invoice via @media print CSS. */
function printInPage() {
  document.body.classList.add('pmh-print-invoice');

  const cleanup = () => {
    document.body.classList.remove('pmh-print-invoice');
  };

  window.addEventListener('afterprint', cleanup, { once: true });
  setTimeout(cleanup, 5000);

  requestAnimationFrame(() => {
    window.focus();
    window.print();
  });
}

export function printInvoice(sale) {
  // Prefer printing the open invoice preview (no pop-ups)
  if (document.getElementById('pmh-invoice')) {
    printInPage();
    return;
  }
  // Fallback if preview not mounted
  printWithIframe(sale).catch(() => printInPage());
}

function InvoiceDocument({ sale }) {
  const items = sale?.items ?? [];
  const subtotal = items.reduce((s, i) => s + i.quantity * Number(i.selling_price), 0);
  const total = Number(sale?.total_amount) || subtotal;

  return (
    <div id="pmh-invoice" className="bg-white text-slate-900">
      <div className="border-b-2 border-pmh-500 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-pmh-600">Pugoda Motor House</h1>
            <p className="text-sm text-slate-500">Spare Parts · Pugoda, Sri Lanka</p>
            <p className="text-sm text-slate-500">Tel: +94 77 000 0000</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">INVOICE</p>
            <p className="text-sm text-slate-500">#{String(sale.id).padStart(6, '0')}</p>
            <p className="text-sm text-slate-500">{formatDate(sale.date)}</p>
          </div>
        </div>
      </div>

      {sale.staff_name && (
        <p className="mt-4 text-sm text-slate-600">
          Served by: <span className="font-medium">{sale.staff_name}</span>
        </p>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200 bg-slate-50">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Item</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Qty</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Unit Price</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">List Price</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                  No line items for this sale.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const listPrice = item.product_list_price != null ? Number(item.product_list_price) : null;
                const hasDiscount = listPrice != null && listPrice > Number(item.selling_price);
                return (
                  <tr key={item.id ?? `${item.product_id}-${item.quantity}`} className="border-b border-slate-100">
                    <td className="px-3 py-2">
                      <p className="font-medium">{item.product_name}</p>
                      {item.brand && <p className="text-xs text-slate-500">{item.brand}</p>}
                    </td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(item.selling_price)}</td>
                    <td className="px-3 py-2 text-right text-slate-500">
                      {hasDiscount ? (
                        <span className="line-through">{formatCurrency(listPrice)}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {formatCurrency(item.quantity * item.selling_price)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-64 space-y-1 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold">
            <span>Total</span>
            <span className="text-pmh-600">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">Thank you for your business!</p>
    </div>
  );
}

export default function Invoice({ sale, onClose }) {
  if (!sale) return null;

  return createPortal(
    <div className="pmh-invoice-overlay fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/70 p-4 sm:p-8">
      <div className="relative my-4 w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="pmh-no-print flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Invoice #{String(sale.id).padStart(6, '0')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <InvoiceDocument sale={sale} />
        </div>

        <div className="pmh-no-print flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-primary" onClick={() => printInvoice(sale)}>
            <Printer size={18} />
            Print Invoice
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
