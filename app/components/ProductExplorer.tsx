"use client";

import { defaultQuery, fetchProducts } from "@/lib/products";
import type {
    Product, ProductDraft, ProductList, SearchQuery,
} from "@/lib/products";
import ProductSearchForm from "./ProductSearchForm";
import ProductForm from "./ProductForm";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

type LoadState = "loading" | "error" | "ready";

// เพิ่ม Props เพื่อรับค่าสถานะการล็อกอินเข้ามาใช้งาน
type ProductExplorerProps = {
    isLoggedIn?: boolean;
    userName?: string | null;
};

export default function ProductExplorer({ isLoggedIn = false, userName }: ProductExplorerProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [status, setStatus] = useState<LoadState>("loading");
    const [errorMessage, setErrorMessage] = useState("");

    const [editing, setEditing] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts(defaultQuery).then(showResult).catch(showError);
    }, []);

    function showResult(list: ProductList) {
        setProducts(list.products);
        setStatus("ready");
    }

    function showError(error: unknown) {
        setErrorMessage(
            error instanceof Error ? error.message : "เรียกข้อมูลไม่สำเร็จ"
        );
        setStatus("error");
    }

    async function loadProducts(query: SearchQuery) {
        setStatus("loading");
        setErrorMessage("");

        try {
            showResult(await fetchProducts(query));
        } catch (error) {
            showError(error);
        }
    }

    function saveProduct(draft: ProductDraft) {
        if (editing) {
            setProducts(products.map(p => p.id === editing.id ? { ...draft, id: editing.id } : p));
            setEditing(null);
        } else {
            setProducts([...products, { ...draft, id: Date.now() }]);
        }
    }

    function removeProduct(id: number) {
        setProducts(products.filter(p => p.id !== id));
        if (editing?.id === id) {
            setEditing(null);
        }
    }

    return (
        <main style={{ padding: '24px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>รายการสินค้า</h1>
                <div>
                    {isLoggedIn ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* เปลี่ยนสีข้อความต้อนรับเป็นสีขาว */}
                            <span style={{ fontSize: '14px', color: '#ffffff' }}>
                                ยินดีต้อนรับ, {userName || "ผู้ดูแลระบบ"}
                            </span>
                            <button
                                type="button"
                                onClick={() => signOut()}
                                style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                            >
                                ออกจากระบบ
                            </button>
                        </div>
                    ) : (
                        <a
                            href="/api/auth/signin"
                            style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontSize: '14px' }}
                        >
                            เข้าสู่ระบบด้วย Google
                        </a>
                    )}
                </div>
            </header>

            <button
                type="button"
                onClick={() => loadProducts(defaultQuery)}
                disabled={status === "loading"}
            >
                {status === "loading" ? "กำลังโหลด" : "โหลดข้อมูล"}
            </button>

            {/* ฟอร์มค้นหา */}
            <ProductSearchForm onSearch={loadProducts} />

            {/* แสดงฟอร์มเพิ่ม/แก้ไข เฉพาะคนที่ล็อกอินแล้วเท่านั้น */}
            {isLoggedIn && (
                <section style={{ margin: "20px 0" }}>
                    <h2>{editing ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h2>
                    <ProductForm
                        editing={editing}
                        onSave={saveProduct}
                        onCancel={() => setEditing(null)}
                    />
                </section>
            )}

            <section aria-live="polite" style={{ marginTop: '20px' }}>
                {status === "loading" && <p>กำลังโหลดข้อมูล</p>}
                {status === "error" && <p role="alert" style={{ color: 'red' }}>{errorMessage}</p>}
                {status === "ready" && products.length === 0 && (
                    <p>ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
                )}

                {status === "ready" && products.length > 0 && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>รูปภาพ</th>
                                <th style={{ padding: '8px' }}>ชื่อสินค้า</th>
                                <th style={{ padding: '8px' }}>ราคา</th>
                                <th style={{ padding: '8px' }}>คงเหลือ</th>
                                <th style={{ padding: '8px' }}>หมวดหมู่</th>
                                <th style={{ padding: '8px' }}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '8px' }}>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {item.images?.map((imgUrl: string, index: number) => (
                                                <img
                                                    key={index}
                                                    src={imgUrl}
                                                    alt={`${item.title} - ${index + 1}`}
                                                    width={40}
                                                    height={40}
                                                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '8px' }}>{item.title}</td>
                                    <td style={{ padding: '8px' }}>{item.price}</td>
                                    <td style={{ padding: '8px' }}>{item.stock}</td>
                                    <td style={{ padding: '8px' }}>{item.category}</td>
                                    <td style={{ padding: '8px' }}>
                                        {/* แสดงปุ่มแก้ไขและลบ เฉพาะเมื่อผู้ใช้ล็อกอินแล้วเท่านั้น */}
                                        {isLoggedIn ? (
                                            <>
                                                <button type="button" onClick={() => setEditing(item)}>แก้ไข</button>
                                                <button type="button" onClick={() => removeProduct(item.id)} style={{ marginLeft: '8px', color: 'red' }}>ลบ</button>
                                            </>
                                        ) : (
                                            <span style={{ color: '#888', fontSize: '12px' }}>สำหรับแอดมิน</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </main>
    );
}