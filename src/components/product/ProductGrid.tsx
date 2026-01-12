"use client";

import styles from "./ProductGrid.module.scss";

export default function ProductGrid({ children }: { children: React.ReactNode }) {
	return <div className={styles.grid}>{children}</div>;
}
