"use client";

import styles from "./ProductGrid.module.scss";

export const ProductGrid = ({ children }: { children: React.ReactNode }) => {
	return <div className={styles.grid}>{children}</div>;
};
