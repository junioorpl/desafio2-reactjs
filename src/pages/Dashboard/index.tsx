import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import {
  Container,
  CardContainer,
  Card,
  TableContainer,
  NoTransactions,
} from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const { data } = await api.get('transactions');

      const convertedTransactions: Transaction[] = data.transactions.map(
        (t: Transaction) => {
          return {
            id: t.id,
            title: t.title,
            value: t.value,
            formattedValue: formatValue(t.value),
            formattedDate: format(parseISO(String(t.created_at)), 'dd/MM/yyyy'),
            type: t.type,
            category: { title: t.category.title },
            created_at: t.created_at,
          };
        },
      );
      // console.log(new Date().toISOString());

      const convertedBalance = {
        income: formatValue(data.balance.income),
        outcome: formatValue(data.balance.outcome),
        total: formatValue(data.balance.total),
      };

      setBalance(convertedBalance);
      setTransactions(convertedTransactions);
    }

    loadTransactions();
  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        {transactions.length === 0 ? (
          <NoTransactions>
            <h1>Você não tem transações ainda :(</h1>
          </NoTransactions>
        ) : (
            <TableContainer>
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Preço</th>
                    <th>Categoria</th>
                    <th>Data</th>
                  </tr>
                </thead>

                {transactions.map(t => (
                  <tbody key={t.id}>
                    <tr>
                      <td className="title">{t.title}</td>
                      <td className={t.type}>
                        {t.type === 'income'
                          ? t.formattedValue
                          : `- ${t.formattedValue}`}
                      </td>
                      <td>{t.category.title}</td>
                      <td>{t.formattedDate}</td>
                    </tr>
                  </tbody>
                ))}
              </table>
            </TableContainer>
          )}
      </Container>
    </>
  );
};

export default Dashboard;
