import Link from "next/link";

import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";

import { getProduct } from "@/lib/products";

import { updateProductAction } from "@/app/actions";



type EditProductPageProps = {

    params: Promise<{ id: string }>;

};



export default async function EditProductPage({

    params,

}: EditProductPageProps) {

    const session = await auth();

    if (!session?.user) {

        redirect("/");

    }



    // เติม: ค่าที่ Next 16 ทำเป็น Promise จึงต้อง await 

    const { id } = await params;

    const product = await getProduct(Number(id));

    if (!product) {

        notFound();

    }



    // เติม: เมธอดที่ผูกอาร์กิวเมนต์แรกให้ฟังก์ชันไว้ล่วงหน้า 

    const updateAction = updateProductAction.bind(null, String(product.id));



    return (

        <main>

            <h1>แก้ไขสินค้า</h1>

            <form action={updateAction}>

                <div>

                    <label htmlFor="name">ชื่อสินค้า</label>

                    <input id="name" name="name" defaultValue={product.title} required />

                </div>

                <div>

                    <label htmlFor="price">ราคา</label>

                    <input

                        id="price"

                        name="price"

                        type="number"

                        min="0"

                        step="0.01"

                        defaultValue={product.price}

                        required

                    />

                </div>

                <div>

                    <label htmlFor="description">รายละเอียด</label>

                    <textarea

                        id="description"

                        name="description"

                        defaultValue={product.description}

                        required

                    />

                </div>

                <div>

                    <button type="submit">บันทึก</button>

                    <Link href="/">ยกเลิก</Link>

                </div>

            </form>

        </main>

    );

}