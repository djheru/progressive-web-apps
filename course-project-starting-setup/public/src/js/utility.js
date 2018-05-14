var dbPromise = idb.open('posts-store', 1, function (db) {
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', {
      keyPath: 'id'
    });
  }
});

var writeData = (st, data) =>
  dbPromise.then(db => {
    var tx = db.transaction(st, 'readwrite');
    var store = tx.objectStore(st);
    store.put(data);
    return tx.complete; // Return tx.complete from write operations
  });

var readAllData = (st) =>
  dbPromise.then(db => {
    var tx = db.transaction(st, 'readonly');
    var store = tx.objectStore(st);
    return store.getAll();
  });

var clearAllData = (st) => dbPromise.then(db => {
    var tx = db.transaction(st, 'readwrite');
    var store = tx.objectStore(st);
    store.clear();
    return tx.complete;
});

var deleteItemFromData = (st, id) => dbPromise.then(db => {
	var tx = db.transaction(st, 'readwrite');
	var store = tx.objectStore(st);
	store.delete(id);
	return tx.complete;
});
