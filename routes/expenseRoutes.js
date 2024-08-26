import { Router } from 'express';

const router = Router();

export default (pool) => {
  // Route to get the list of expenses
  router.get('/', async (req, res) => {
    try {
      const { rows: expenses } = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
      // Ensure amounts are numbers
      expenses.forEach(expense => {
        expense.amount = Number(expense.amount);
      });
      res.render('expenses/list', { expenses }); // Renders views/expenses/list.ejs
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve expenses' });
    }
  });

  // Route to render the form for adding a new expense
  router.get('/new', (req, res) => {
    res.render('expenses/form'); // Renders views/expenses/form.ejs
  });

  // Route to create a new expense
  router.post('/', async (req, res) => {
    const { description, amount, date } = req.body;
    try {
      await pool.query(
        'INSERT INTO expenses (description, amount, date) VALUES ($1, $2, $3) RETURNING *',
        [description, Number(amount), date] // Ensure amount is a number
      );
      res.redirect('/expenses');
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create expense' });
    }
  });

  // Route to get a single expense by ID
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
      const expense = result.rows[0];
      if (expense) {
        expense.amount = Number(expense.amount); // Ensure amount is a number
        res.render('expenses/detail', { expense }); // Renders views/expenses/detail.ejs
      } else {
        res.status(404).render('404'); // Renders views/404.ejs
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve expense' });
    }
  });

  // Route to render the form for editing an expense
  router.get('/:id/edit', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
      const expense = result.rows[0];
      if (expense) {
        expense.amount = Number(expense.amount); // Ensure amount is a number
        res.render('expenses/update', { expense }); // Renders views/expenses/update.ejs
      } else {
        res.status(404).render('404'); // Renders views/404.ejs
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve expense for editing' });
    }
  });

  // Route to update an existing expense
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { description, amount, date } = req.body;
    try {
      await pool.query(
        'UPDATE expenses SET description = $1, amount = $2, date = $3 WHERE id = $4',
        [description, Number(amount), date, id] // Ensure amount is a number
      );
      res.redirect('/expenses');
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update expense' });
    }
  });

  // Route to delete an expense
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
      res.redirect('/expenses');
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  });

  return router;
};
