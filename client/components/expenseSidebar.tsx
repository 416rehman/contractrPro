"use client";
import {useEffect, useState} from "react";
import {loadExpenses, useExpensesStore} from "@/services/expenses";
import {useUserStore} from "@/services/user";
import {useParams} from "next/navigation";
import SubSidebar from "@/components/subSidebar";
import {Button} from "@nextui-org/button";
import NextLink from "next/link";
import {IconDevicesDollar, IconReceipt2} from "@tabler/icons-react";

type Props = {
    className?: string;
}

/**
 * This is the sidebar for the expenses page. It displays a list of expenses and should allow the user to filter them.
 * It handles communication with the API and updates the local state via the expense service.
 * This is used in tandem with the expenseForm component to edit/create expenses.
 */
export default function ExpenseSidebar({className}: Props) {
    const [currentOrg] = useUserStore(state => [state.currentOrganization]);
    const [expenses] = useExpensesStore(state => [state.expenses]);
    const [filter, setFilter] = useState("");
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const params = useParams();

    useEffect(() => {
        loadExpenses(currentOrg?.id);
    }, [currentOrg?.id]);

    useEffect(() => {
        // filter
        const filteredItems = expenses.filter((item: any) => item.expenseNumber.toLowerCase().includes(filter.toLowerCase()));
        setFilteredExpenses(filteredItems || []);
    }, [filter, expenses]);

    return <SubSidebar className={className} items={
        filteredExpenses?.map((expense: any) => {
            return <li key={expense.id}>
                <Button
                    className={"w-full justify-start text-default-600 font-medium"}
                    as={NextLink}
                    href={"/expenses/" + expense?.id}
                    startContent={<IconDevicesDollar className={"text-default-400"} size={"20"}/>}
                    variant={params.id === expense?.id ? "flat" : "light"}
                    size={"sm"}>
                    <span className={"truncate"}>{expense?.expenseNumber}</span>
                </Button>
            </li>
        })} title={"Expense"} setFilter={setFilter} filter={filter} newItemUrl={"/expenses/new"}/>;
}