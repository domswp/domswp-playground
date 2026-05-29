//! Snake — logika game di Rust, di-compile ke WASM (cdylib murni).
//! Rendering & input ditangani JS; di sini hanya state + tick + grid buffer.

const MAX_COLS: usize = 40;
const MAX_ROWS: usize = 40;
const MAX_CELLS: usize = MAX_COLS * MAX_ROWS;

#[derive(Clone, Copy, PartialEq)]
enum Cell {
    Empty = 0,
    Body = 1,
    Head = 2,
    Food = 3,
}

#[derive(Clone, Copy, PartialEq)]
enum Dir {
    Up,
    Right,
    Down,
    Left,
}

struct Game {
    cols: usize,
    rows: usize,
    // Tubuh ular: indeks 0 = ekor, terakhir = kepala.
    body: [(i32, i32); MAX_CELLS],
    len: usize,
    dir: Dir,
    next_dir: Dir,
    food: (i32, i32),
    score: u32,
    over: bool,
    rng: u32,
    grid: [u8; MAX_CELLS],
}

static mut GAME: Game = Game {
    cols: 0,
    rows: 0,
    body: [(0, 0); MAX_CELLS],
    len: 0,
    dir: Dir::Right,
    next_dir: Dir::Right,
    food: (0, 0),
    score: 0,
    over: false,
    rng: 1,
    grid: [0u8; MAX_CELLS],
};

fn rng_next(state: &mut u32) -> u32 {
    // xorshift32
    let mut x = *state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    *state = x;
    x
}

impl Game {
    fn reset(&mut self, cols: usize, rows: usize, seed: u32) {
        self.cols = cols.min(MAX_COLS).max(8);
        self.rows = rows.min(MAX_ROWS).max(8);
        self.rng = if seed == 0 { 0x1234_5678 } else { seed };
        self.score = 0;
        self.over = false;
        self.dir = Dir::Right;
        self.next_dir = Dir::Right;

        let cx = (self.cols / 2) as i32;
        let cy = (self.rows / 2) as i32;
        self.len = 3;
        self.body[0] = (cx - 2, cy);
        self.body[1] = (cx - 1, cy);
        self.body[2] = (cx, cy);

        self.place_food();
    }

    fn place_food(&mut self) {
        loop {
            let r = rng_next(&mut self.rng);
            let x = (r % self.cols as u32) as i32;
            let y = ((r / self.cols as u32) % self.rows as u32) as i32;
            if !self.on_snake(x, y) {
                self.food = (x, y);
                return;
            }
        }
    }

    fn on_snake(&self, x: i32, y: i32) -> bool {
        for i in 0..self.len {
            if self.body[i] == (x, y) {
                return true;
            }
        }
        false
    }

    fn set_dir(&mut self, d: u32) {
        let nd = match d {
            0 => Dir::Up,
            1 => Dir::Right,
            2 => Dir::Down,
            _ => Dir::Left,
        };
        // Cegah balik arah 180°.
        let opposite = matches!(
            (self.dir, nd),
            (Dir::Up, Dir::Down)
                | (Dir::Down, Dir::Up)
                | (Dir::Left, Dir::Right)
                | (Dir::Right, Dir::Left)
        );
        if !opposite {
            self.next_dir = nd;
        }
    }

    fn tick(&mut self) {
        if self.over {
            return;
        }
        self.dir = self.next_dir;
        let (hx, hy) = self.body[self.len - 1];
        let (mut nx, mut ny) = (hx, hy);
        match self.dir {
            Dir::Up => ny -= 1,
            Dir::Right => nx += 1,
            Dir::Down => ny += 1,
            Dir::Left => nx -= 1,
        }

        // Tabrak dinding.
        if nx < 0 || ny < 0 || nx >= self.cols as i32 || ny >= self.rows as i32 {
            self.over = true;
            return;
        }

        let eating = (nx, ny) == self.food;

        // Tabrak tubuh sendiri (ekor akan bergerak kecuali sedang makan).
        let check_from = if eating { 0 } else { 1 };
        for i in check_from..self.len {
            if self.body[i] == (nx, ny) {
                self.over = true;
                return;
            }
        }

        if eating {
            // Tambah kepala tanpa hapus ekor.
            self.body[self.len] = (nx, ny);
            self.len += 1;
            self.score += 1;
            self.place_food();
        } else {
            // Geser badan: hapus ekor, tambah kepala.
            for i in 0..self.len - 1 {
                self.body[i] = self.body[i + 1];
            }
            self.body[self.len - 1] = (nx, ny);
        }
    }

    fn rebuild_grid(&mut self) {
        let n = self.cols * self.rows;
        for i in 0..n {
            self.grid[i] = Cell::Empty as u8;
        }
        let (fx, fy) = self.food;
        self.grid[(fy as usize) * self.cols + fx as usize] = Cell::Food as u8;
        for i in 0..self.len {
            let (x, y) = self.body[i];
            let idx = (y as usize) * self.cols + x as usize;
            self.grid[idx] = if i == self.len - 1 {
                Cell::Head as u8
            } else {
                Cell::Body as u8
            };
        }
    }
}

// ---- C-ABI exports untuk dipanggil dari JS ----

#[no_mangle]
pub extern "C" fn init(cols: u32, rows: u32, seed: u32) {
    unsafe {
        GAME.reset(cols as usize, rows as usize, seed);
        GAME.rebuild_grid();
    }
}

#[no_mangle]
pub extern "C" fn set_dir(d: u32) {
    unsafe { GAME.set_dir(d) }
}

#[no_mangle]
pub extern "C" fn tick() {
    unsafe {
        GAME.tick();
        GAME.rebuild_grid();
    }
}

#[no_mangle]
pub extern "C" fn restart() {
    unsafe {
        let (c, r) = (GAME.cols as u32, GAME.rows as u32);
        let seed = rng_next(&mut GAME.rng);
        GAME.reset(c as usize, r as usize, seed);
        GAME.rebuild_grid();
    }
}

#[no_mangle]
pub extern "C" fn score() -> u32 {
    unsafe { GAME.score }
}

#[no_mangle]
pub extern "C" fn is_over() -> u32 {
    unsafe { GAME.over as u32 }
}

#[no_mangle]
pub extern "C" fn cols() -> u32 {
    unsafe { GAME.cols as u32 }
}

#[no_mangle]
pub extern "C" fn rows() -> u32 {
    unsafe { GAME.rows as u32 }
}

#[no_mangle]
pub extern "C" fn grid_ptr() -> *const u8 {
    unsafe { GAME.grid.as_ptr() }
}

#[no_mangle]
pub extern "C" fn grid_len() -> u32 {
    unsafe { (GAME.cols * GAME.rows) as u32 }
}
